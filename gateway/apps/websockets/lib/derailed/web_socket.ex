defmodule Derailed.WebSocket do
  @behaviour :cowboy_websocket

  defp op_to_atom(t) do
    %{
      0 => :identify
      # 1 => :dispatch,
      # 2 => :hello
    }[t]
  end

  def init(req, _state) do
    {:cowboy_websocket, req, %{}, %{"compress" => true}}
  end

  def websocket_init(_state) do
    # TODO: websocket hb timeout
    {[
       {:text,
        Jason.encode!(%{
          op: 2,
          d: nil
        })}
     ],
     %{
       sequence: 0,
       ready: false,
       session_id: nil,
       session_pid: nil,
       session_ref: nil,
       user_id: nil
     }}
  end

  def websocket_handle({:text, raw_data}, state) do
    {:ok, data} = Jason.decode(raw_data)

    d = Map.new(data)
    handle(op_to_atom(Map.get(d, "op")), Map.get(d, "d"), state)
  end

  def websocket_handle(_any, state) do
    {[], state}
  end

  def handle(:identify, data, state) do
    case Derailed.Contracts.Identify.conform(data) do
      {:ok, model} ->
        token_session_id = :crypto.hash(:sha256, model[:token]) |> Base.encode16(case: :lower)

        {_, result} =
          Postgrex.prepare_execute!(
            :db,
            "get_session_by_id",
            "SELECT * FROM sessions WHERE id = $1;",
            [token_session_id]
          )

        case Derailed.DB.map(result) do
          {:ok, auth_session} ->
            user_id = Map.get(auth_session, "account_id")
            session_id = Base.url_encode64(:crypto.strong_rand_bytes(16), padding: false)

            {:ok, session_pid} =
              GenRegistry.lookup_or_start(Derailed.Session, session_id, [
                session_id,
                user_id,
                self()
              ])

            {:ok, reg_pid} =
              GenRegistry.lookup_or_start(Derailed.SessionRegistry, user_id, [user_id])

            Derailed.SessionRegistry.add_session(reg_pid, session_id, session_pid)
            Derailed.Session.dispatch_ready(session_pid)

            {:ok,
             %{
               state
               | user_id: user_id,
                 session_id: session_id,
                 session_pid: session_pid,
                 session_ref: Process.monitor(session_pid),
                 ready: true
             }}

          {:error, :no_rows_nil} ->
            {[{:close, 4003, "Invalid token"}], state}
        end

      {:error, why} ->
        {[{:close, 4002, Jason.encode!(Enum.map(why, &to_string/1))}], state}
    end
  end

  def handle(_type, _data, state) do
    {[{:close, 4001, "Invalid message type"}], state}
  end

  def websocket_info({:event, type, data}, state) do
    {[{:text, Jason.encode!(%{op: 1, t: type, d: data, s: state[:sequence] + 1})}],
     %{state | sequence: state[:sequence] + 1}}
  end

  # NOTE: this will only ever be called if Session somehow goes down
  def websocket_info({:DOWN, _ref, :process, _pid, _reason}, state) do
    {[{:close, 4004, "Internal Server Error"}], state}
  end

  def websocket_info(_any, state) do
    {[], state}
  end
end
