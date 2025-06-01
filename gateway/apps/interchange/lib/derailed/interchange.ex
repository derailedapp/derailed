# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

defmodule Derailed.Interchange do
  use GRPC.Server, service: Derailed.Gateway.Gateway.Service

  @spec dispatch_user(Derailed.Gateway.Interchange.t(), GRPC.Server.Stream.t()) ::
          Google.Protobuf.Empty.t()
  def dispatch_user(request, _stream) do
    user_id = request.id
    type = request.t
    data = Jason.decode!(request.d)

    case GenRegistry.lookup(Derailed.SessionRegistry, user_id) do
      # this is a cautionary precaution. I've seen processes somehow be debugged and error out
      # as non-alive for some reason. This should happen since GenRegistry captures all children EXITs. Weird.
      # https://github.com/discord/gen_registry/blob/master/lib/gen_registry.ex#L204
      {:ok, pid} ->
        Derailed.SessionRegistry.dispatch(pid, type, data)

      _ ->
        :ok
    end

    %Google.Protobuf.Empty{}
  end

  @spec dispatch_channel(Derailed.Gateway.Interchange.t(), GRPC.Server.Stream.t()) ::
          Google.Protobuf.Empty.t()
  def dispatch_channel(request, _stream) do
    channel_id = request.id
    type = request.t
    data = Jason.decode!(request.d)

    case GenRegistry.lookup(Derailed.PrivateChannel, channel_id) do
      {:ok, pid} ->
        Derailed.PrivateChannel.dispatch(pid, type, data)

      _ ->
        :ok
    end

    %Google.Protobuf.Empty{}
  end
end
