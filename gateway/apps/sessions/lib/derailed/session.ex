defmodule Derailed.Session do
  use GenServer

  def start_link(id) do
    GenServer.start_link(__MODULE__, id)
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

    {:ok,
     %{
       id: id,
       user_id: user_id,
       profile: profile,
       account: account,
       relationships: relationships,
       private_channel_pids: private_channel_pids,
       ws_pid: ws_pid,
       ws_ref: Process.monitor(ws_pid)
     }}
  end

  @spec dispatch_ready(pid()) :: :ok
  def dispatch_ready(pid) do
    GenServer.cast(pid, :dispatch_ready)
  end

  def handle_cast(:dispatch_ready, state) do
    Manifold.send(state[:ws_pid], {
      :event,
      "READY",
      %{
        relationships: state[:relationships],
        account: state[:account],
        profile: state[:profile]
      }
    })

    {:noreply, state}
  end
end
