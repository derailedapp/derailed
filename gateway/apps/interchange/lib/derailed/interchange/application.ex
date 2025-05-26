defmodule Derailed.Interchange.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {GRPC.Server.Supervisor,
       endpoint: Derailed.Gateway.Endpoint, port: 50051, start_server: true}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Derailed.Interchange.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
