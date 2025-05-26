# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

defmodule Derailed.PrivateChannel do
  use GenServer

  def start_link(id) do
    GenServer.start_link(__MODULE__, id)
  end

  def init(id) do
    {_, result} =
      Postgrex.prepare_execute!(
        :db,
        "get_private_channel",
        "SELECT * FROM channels WHERE id = $1;",
        [id]
      )

    {:ok, channel} = Derailed.DB.map(result)

    {_, result} =
      Postgrex.prepare_execute!(
        :db,
        "get_channel_members",
        "SELECT * FROM profiles WHERE id IN (SELECT user_id FROM channel_members WHERE channel_id = $1);",
        [id]
      )

    {:ok, channel_members} = Derailed.DB.maps(result)

    channel_members =
      Map.new(Enum.map(channel_members, fn member -> {Map.get(member, "user_id"), member} end))

    {:ok,
     %{
       id: id,
       data: channel,
       members: channel_members,
       sessions: Map.new(),
       session_refs: Map.new()
     }}
  end

  @spec subscribe(pid(), pid()) :: :ok
  def subscribe(pid, session_pid) do
    GenServer.cast(pid, {:subscribe, session_pid})
  end

  @spec dispatch(pid(), String.t(), term()) :: :ok
  def dispatch(pid, type, data) do
    GenServer.call(pid, {:dispatch, type, data})
  end

  def handle_cast({:subscribe, session_id, session_pid}, %{sessions: sessions} = state) do
    {:noreply,
     %{
       state
       | sessions: Map.put(sessions, session_id, session_pid),
         session_refs: Map.put(sessions, Process.monitor(session_pid), session_pid)
     }}
  end

  def handle_call({:dispatch, type, data}, %{sessions: sessions} = state) do
    Manifold.send(Map.values(sessions), {:dispatch, type, data})
    {:reply, :ok, state}
  end

  def handle_info(
        {:DOWN, ref, :process, _pid, _reason},
        %{sessions: sessions, session_refs: session_refs} = state
      ) do
    session_id = Map.get(session_refs, ref)

    {:noreply,
     %{
       state
       | sessions: Map.delete(sessions, session_id),
         session_refs: Map.delete(session_refs, ref)
     }}
  end
end
