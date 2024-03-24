defmodule Derailed.API.Router do
  use Plug.Router

  plug(Plug.Logger)
  plug(:match)
  plug(:dispatch)

  forward("/users", to: Derailed.API.Router.User)
  forward("/guilds", to: Derailed.API.Router.Guild)

  match _ do
    send_resp(conn, 404, Jsonrs.encode!(%{code: 0, reason: "Not Found"}))
  end
end
