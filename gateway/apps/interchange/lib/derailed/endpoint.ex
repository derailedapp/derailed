# Define your endpoint
defmodule Derailed.Gateway.Endpoint do
  use GRPC.Endpoint

  intercept(GRPC.Server.Interceptors.Logger)
  run(Derailed.Interchange)
end
