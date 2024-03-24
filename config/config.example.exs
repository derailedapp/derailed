import Config

# CHANGE THIS!
# This is all db credentials. Change these before booting up Derailed.
config :database, Derailed.Repo,
  database: "database_repo",
  username: "user",
  password: "pass",
  hostname: "localhost"

config :database, ecto_repos: [Derailed.Repo]

config :joken, default_signer: "secret"
