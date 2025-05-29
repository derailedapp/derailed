# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

defmodule Derailed.Session do
  use GenServer

  def start_link({id, user_id, ws_pid}) do
    GenServer.start_link(__MODULE__, {id, user_id, ws_pid})
  end

  def init({id, user_id, ws_pid}) do
    {_, result} =
      Postgrex.prepare_execute!(
        :db,
        "get_user_account",
        "SELECT * FROM accounts WHERE id = $1;",
        [user_id]
      )

    {:ok, account} = Derailed.DB.map(result)
    {_, account} = Map.pop!(account, "password")

    {_, result} =
      Postgrex.prepare_execute!(
        :db,
        "get_user_profile",
        "SELECT * FROM profiles WHERE user_id = $1;",
        [user_id]
      )

    {:ok, profile} = Derailed.DB.map(result)

    {_, result} =
      Postgrex.prepare_execute!(
        :db,
        "get_relationships",
        "SELECT * FROM relationships WHERE user_id = $1;",
        [user_id]
      )

    {:ok, relationships} = Derailed.DB.maps(result)

    relationships =
      Enum.map(relationships, fn rel ->
        {_, result} =
          Postgrex.prepare_execute!(
            :db,
            "get_user_profile",
            "SELECT * FROM profiles WHERE user_id = $1;",
            [Map.get(rel, "target_user_id", 0)]
          )

        {:ok, profile} = Derailed.DB.map(result)
        Map.put(Map.delete(Map.delete(rel, "user_id"), "target_user_id"), "target_user", profile)
      end)

    {_, result} =
      Postgrex.prepare_execute!(
        :db,
        "get_joined_private_channels",
        "SELECT * FROM channels WHERE id IN (SELECT channel_id FROM channel_members WHERE user_id = $1);",
        [user_id]
      )

    {:ok, private_channels} = Derailed.DB.maps(result)

    private_channel_pids =
      Map.new(
        Enum.map(private_channels, fn channel ->
          channel_id = Map.get(channel, "id")

          {:ok, pid} =
            GenRegistry.lookup_or_start(Derailed.PrivateChannel, channel_id, [channel_id])

          {channel_id, pid}
        end)
      )

    private_channel_refs =
      Map.new(
        Enum.map(private_channel_pids, fn {channel_id, pid} ->
          {Process.monitor(pid), channel_id}
        end)
      )

    {:ok,
     %{
       id: id,
       user_id: user_id,
       profile: profile,
       account: account,
       relationships: relationships,
       private_channels: private_channels,
       private_channel_pids: private_channel_pids,
       private_channel_refs: private_channel_refs,
       channels_just_deleted: MapSet.new(),
       ws_pid: ws_pid,
       ws_ref: Process.monitor(ws_pid),
       ws_down: false,
       message_queue: nil
     }}
  end

  @spec dispatch_ready(pid()) :: :ok
  def dispatch_ready(pid) do
    GenServer.cast(pid, :dispatch_ready)
  end

  @spec dispatch(pid(), String.t(), term()) :: :ok
  def dispatch(pid, type, data) do
    GenServer.call(pid, {:dispatch, type, data})
  end

  @spec resume_ws(pid(), pid()) :: :ok | {:error, :ws_unresumable}
  def resume_ws(pid, new_ws_pid) do
    GenServer.call(pid, {:resume_ws, new_ws_pid})
  end

  def handle_cast(:dispatch_ready, %{id: id} = state) do
    channels =
      Enum.map(state[:private_channels], fn channel ->
        channel_id = Map.get(channel, "id")
        {:ok, channel_pid} = GenRegistry.lookup(Derailed.PrivateChannel, channel_id)
        Map.put(channel, "members", Derailed.PrivateChannel.get_channel_members(channel_pid))
      end)

    Manifold.send(state[:ws_pid], {
      :event,
      "READY",
      %{
        relationships: state[:relationships],
        account: state[:account],
        profile: state[:profile],
        private_channels: channels,
        session_id: id
      }
    })

    {:noreply, state}
  end

  def handle_call(
        {:dispatch, type, data},
        from,
        %{
          ws_down: ws_down,
          message_queue: message_queue,
          channels_just_deleted: channels_just_deleted,
          private_channels: pchannels,
          private_channel_pids: pc_pids,
          private_channel_refs: pc_refs
        } = state
      ) do
    state =
      case type do
        "PRIVATE_CHANNEL_DELETE" ->
          %{state | channels_just_deleted: MapSet.put(channels_just_deleted, from)}

        "PRIVATE_CHANNEL_CREATE" ->
          channel_id = Map.get(data, "id")

          {:ok, channel_pid} =
            GenRegistry.lookup_or_start(Derailed.PrivateChannel, channel_id, [channel_id])

          %{
            state
            | private_channels: MapSet.put(pchannels, data),
              private_channel_pids: MapSet.put(pc_pids, channel_pid),
              private_channel_refs: MapSet.put(pc_refs, Process.monitor(channel_pid))
          }

        _ ->
          state
      end

    data =
      case type do
        "PRIVATE_CHANNEL_CREATE" ->
          channel_id = Map.get(data, "id")
          {:ok, channel_pid} = GenRegistry.lookup(Derailed.PrivateChannel, channel_id)
          Map.put(data, "members", Derailed.PrivateChannel.get_channel_members(channel_pid))

        _ ->
          data
      end

    msg = {
      :event,
      type,
      data
    }

    if ws_down do
      {:reply, :ok, %{state | message_queue: :queue.in(msg, message_queue)}}
    else
      Manifold.send(state[:ws_pid], msg)

      {:reply, :ok, state}
    end
  end

  def handle_call(
        {:resume_ws, ws_pid},
        _from,
        %{ws_down: ws_down, message_queue: message_queue} = state
      ) do
    if not ws_down do
      {:reply, {:error, :ws_unresumable}, state}
    else
      Enum.each(:queue.to_list(message_queue), fn msg -> Manifold.send(ws_pid, msg) end)

      {:reply, :ok,
       %{
         state
         | ws_down: false,
           ws_pid: ws_pid,
           ws_ref: Process.monitor(ws_pid),
           message_queue: nil
       }}
    end
  end

  def handle_info({:dispatch, type, data}, state) do
    Derailed.Session.dispatch(self(), type, data)
    {:noreply, state}
  end

  def handle_info(:assure_online, %{ws_down: ws_down} = state) do
    if ws_down do
      {:stop, :ws_down, state}
    else
      {:noreply, state}
    end
  end

  def handle_info(
        {:DOWN, ref, :process, pid, _reason},
        %{
          ws_pid: ws_pid,
          private_channel_pids: private_channel_pids,
          private_channel_refs: private_channel_refs,
          channels_just_deleted: channels_just_deleted
        } = state
      ) do
    if pid == ws_pid do
      :erlang.send_after(300_000, self(), :assure_online)
      {:noreply, %{state | ws_pid: nil, ws_ref: nil, ws_down: true}}
    else
      if Enum.any?(Map.values(private_channel_pids), fn e -> e == pid end) do
        if Enum.any?(channels_just_deleted, fn p -> p == pid end) do
          channel_id = Map.get(private_channel_refs, ref)

          {:noreply,
           %{
             state
             | private_channel_pids: Map.delete(private_channel_pids, channel_id),
               private_channel_refs: Map.delete(private_channel_refs, ref),
               channels_just_deleted: MapSet.delete(channels_just_deleted, pid)
           }}
        else
          channel_id = Map.get(private_channel_refs, ref)

          {:ok, new_pid} =
            GenRegistry.lookup_or_start(Derailed.PrivateChannel, channel_id, [channel_id])

          {:noreply,
           %{
             state
             | private_channel_pids: Map.replace(private_channel_pids, channel_id, new_pid),
               private_channel_refs: Map.replace(private_channel_refs, ref, channel_id)
           }}
        end
      else
        {:noreply, state}
      end
    end
  end
end
