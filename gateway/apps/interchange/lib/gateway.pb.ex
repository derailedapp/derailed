defmodule Derailed.Gateway.Interchange do
  @moduledoc false

  use Protobuf, protoc_gen_elixir_version: "0.14.0", syntax: :proto3

  field(:t, 1, type: :string)
  field(:id, 2, type: :string)
  field(:d, 3, type: :string)
end

defmodule Derailed.Gateway.GuildInfo do
  @moduledoc false

  use Protobuf, protoc_gen_elixir_version: "0.14.0", syntax: :proto3

  field(:id, 1, type: :string)
end

defmodule Derailed.Gateway.GuildMetadata do
  @moduledoc false

  use Protobuf, protoc_gen_elixir_version: "0.14.0", syntax: :proto3

  field(:available, 1, type: :bool)
  field(:presences, 2, type: :int32)
end

defmodule Derailed.Gateway.Gateway.Service do
  @moduledoc false

  use GRPC.Service, name: "derailed.gateway.Gateway", protoc_gen_elixir_version: "0.14.0"

  rpc(:dispatch_user, Derailed.Gateway.Interchange, Google.Protobuf.Empty)

  rpc(:dispatch_channel, Derailed.Gateway.Interchange, Google.Protobuf.Empty)
end

defmodule Derailed.Gateway.Gateway.Stub do
  @moduledoc false

  use GRPC.Stub, service: Derailed.Gateway.Gateway.Service
end
