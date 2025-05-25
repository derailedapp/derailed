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

    {:ok,
     %{
       id: id,
       user_id: user_id,
       profile: profile,
       account: account,
       relationships: relationships,
       ws_pid: ws_pid,
       ws_ref: Process.monitor(ws_pid)
     }}
  end
end
