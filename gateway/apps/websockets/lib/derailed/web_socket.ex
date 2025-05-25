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
       session_ref: nil
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
        :ok

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

  def websocket_info({:DOWN, _ref, :process, _pid, _reason}, state) do
    {[{:close, 4004, "Internal Server Error"}], state}
  end

  def websocket_info(_any, state) do
    {[], state}
  end
end
