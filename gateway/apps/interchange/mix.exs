defmodule Derailed.Interchange.MixProject do
  use Mix.Project

  def project do
    [
      app: :interchange,
      version: "0.0.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.17",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      extra_applications: [:logger],
      mod: {Derailed.Interchange.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:grpc, "~> 0.10"},
      {:gen_registry, "~> 1.3.0"},
      {:protobuf, "~> 0.14.1"},
      {:private_channels, in_umbrella: true},
      {:sessions, in_umbrella: true},
      {:jason, "~> 1.4"}
    ]
  end
end
