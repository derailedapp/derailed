# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

defmodule Derailed.SessionRegistry do
  use GenServer

  def start_link(id) do
    GenServer.start_link(__MODULE__, id)
  end

  def init(user_id) do
    {:ok,
     %{
       user_id: user_id,
       sessions: Map.new(),
       session_refs: Map.new()
     }}
  end

  @spec add_session(pid(), String.t(), pid()) :: :ok
  def add_session(pid, session_id, session_pid) do
    GenServer.cast(pid, {:add_session, session_id, session_pid})
  end

  @spec dispatch(pid(), String.t(), map()) :: :ok
  def dispatch(pid, type, data) do
    GenServer.call(pid, {:dispatch, type, data})
  end

  def handle_cast(
        {:add_session, session_id, session_pid},
        %{sessions: sessions, session_refs: session_refs} = state
      ) do
    {:noreply,
     %{
       state
       | sessions: Map.put(sessions, session_id, session_pid),
         session_refs: Map.put(session_refs, Process.monitor(session_pid), session_id)
     }}
  end

  def handle_call({:dispatch, type, data}, %{sessions: sessions} = state) do
    Enum.each(sessions, fn pid -> Derailed.Session.dispatch(pid, type, data) end)
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
