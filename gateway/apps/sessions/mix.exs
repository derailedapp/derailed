defmodule Derailed.Session.MixProject do
  use Mix.Project

  def project do
    [
      app: :sessions,
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
      mod: {Derailed.Session.Application, []}
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:gen_registry, "~> 1.3.0"},
      {:postgrex, "~> 0.20.0"},
      {:db, in_umbrella: true},
      {:manifold, "~> 1.6.0"}
    ]
  end
end
