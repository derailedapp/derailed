# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

defmodule Derailed.WebSocket do
  @behaviour :cowboy_websocket

  @spec hb_timer(non_neg_integer()) :: reference()
  def hb_timer(time) do
    :erlang.send_after(time + 2000, self(), :check_heartbeat)
  end

  defp op_to_atom(t) do
    %{
      0 => :identify,
      # 1 => :dispatch,
      # 2 => :hello
      3 => :resume,
      4 => :heartbeat
      # 5 => :resumed
      # 6 => :ack
    }[t]
  end

  def init(req, _state) do
    {:cowboy_websocket, req, %{}, %{"compress" => true}}
  end

  def websocket_init(_state) do
    heartbeat_interval = Enum.random(42_000..48_000)

    {[
       {:text,
        Jason.encode!(%{
          op: 2,
          d: heartbeat_interval
        })}
     ],
     %{
       sequence: 0,
       ready: false,
       session_id: nil,
       session_pid: nil,
       session_ref: nil,
       user_id: nil,
       heartbeat_interval: heartbeat_interval,
       heartbeat_received: false
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
        token_session_id =
          Base.encode16(:crypto.hash(:sha256, Map.get(model, "token")), case: :lower)

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
              GenRegistry.start(Derailed.Session, session_id, [
                {
                  session_id,
                  user_id,
                  self()
                }
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

  def handle(:resume, data, %{ready: ready} = state) do
    if ready do
      {:ok, state}
    else
      case Derailed.Contracts.Resume.conform(data) do
        {:ok, model} ->
          token_session_id =
            :crypto.hash(:sha256, Map.get(model, "token")) |> Base.encode16(case: :lower)

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

              case GenRegistry.lookup(Derailed.Session, Map.get(model, "session_id")) do
                {:ok, session_pid} ->
                  case Derailed.Session.resume_ws(session_pid, self()) do
                    :ok ->
                      {[
                         {:text,
                          Jason.encode!(%{
                            op: 5,
                            d: nil
                          })}
                       ],
                       %{
                         state
                         | user_id: user_id,
                           session_id: model[:session_id],
                           session_pid: session_pid,
                           session_ref: Process.monitor(session_pid),
                           ready: true
                       }}
                  end

                {:error, :not_found} ->
                  {[{:close, 4006, "Invalid session"}], state}
              end

            {:error, :no_rows_nil} ->
              {[{:close, 4003, "Invalid token"}], state}
          end

        {:error, why} ->
          {[{:close, 4002, Jason.encode!(Enum.map(why, &to_string/1))}], state}
      end
    end
  end

  def handle(
        :heartbeat,
        data,
        %{heartbeat_received: heartbeat_received, sequence: current_sequence} = state
      ) do
    case Derailed.Contracts.Heartbeat.conform(data) do
      {:ok, model} ->
        if heartbeat_received do
          {:ok, state}
        else
          claimed_seq = Map.get(model, "sequence")

          if claimed_seq > current_sequence or current_sequence - 10 > claimed_seq do
            {[{:close, 4008, "Sequence is invalid or too outdated"}], state}
          else
            {[
               {:text,
                Jason.encode!(%{
                  op: 6,
                  d: 0
                })}
             ], %{state | sequence: 0, heartbeat_received: true}}
          end
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

  def websocket_info(:check_heartbeat, %{heartbeat_received: heartbeat_received} = state) do
    if heartbeat_received do
      {[], state}
    else
      {[{:close, 4005, "Heartbeat timer has timed out"}], state}
    end
  end

  def websocket_info(_any, state) do
    {[], state}
  end
end
