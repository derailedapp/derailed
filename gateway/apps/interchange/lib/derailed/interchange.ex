# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

defmodule Derailed.Interchange do
  use GRPC.Server, service: Derailed.Gateway.Gateway.Service

  @spec dispatch_user(Derailed.Gateway.Interchange.t(), GRPC.Server.Stream.t()) ::
          Google.Protobuf.Empty.t()
  def dispatch_user(request, _stream) do
    user_id = request.id
    type = request.t
    data = request.d

    case GenRegistry.lookup(Derailed.SessionRegistry, user_id) do
      {:ok, pid} -> Derailed.SessionRegistry.dispatch(pid, type, data)
    end

    %Google.Protobuf.Empty{}
  end

  @spec dispatch_channel(Derailed.Gateway.Interchange.t(), GRPC.Server.Stream.t()) ::
          Google.Protobuf.Empty.t()
  def dispatch_channel(request, _stream) do
    channel_id = request.id
    type = request.t
    data = request.d

    case GenRegistry.lookup(Derailed.PrivateChannel, channel_id) do
      {:ok, pid} -> Derailed.PrivateChannel.dispatch(pid, type, data)
    end

    %Google.Protobuf.Empty{}
  end
end
