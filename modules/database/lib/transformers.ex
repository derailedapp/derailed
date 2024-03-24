defmodule Derailed.Transformers do
  @moduledoc """
  General transformation utilities which help across all of Derailed's backend.
  """

  import Plug.Conn

  def resolve_schema(schema) do
    {schema, ExJsonSchema.Schema.resolve(schema)}
  end

  @spec user(struct(), boolean()) :: map()
  def user(struct, public \\ true) do
    m = Map.delete(Map.delete(Map.from_struct(struct), :__meta__), :password)

    if public do
      Map.delete(m, :email)
    else
      m
    end
  end

  @spec authorize(Plug.Conn.t()) :: {:ok, Derailed.DB.User} | :error
  def authorize(conn) do
    auth = Map.get(conn, "authorization")
    if not is_nil(auth) do
      case Derailed.Token.verify_and_validate(auth) do
        {:ok, claims} ->
          user_id = Map.get(claims, "user_id")

          user = Derailed.Repo.get(Derailed.DB.User, user_id)

          if is_nil(user) do
            delete_resp_cookie(conn, "authorization")
            send_resp(conn, 401, Jsonrs.encode!(%{"code" => 10, "reason" => "User account already terminated"}))

            :error
          else
            user
          end
        {:error, _reason} ->
          delete_resp_cookie(conn, "authorization")
          send_resp(conn, 401, Jsonrs.encode!(%{"code" => 10, "reason" => "Invalid authorization cookie"}))

          :error
      end
    else
      send_resp(conn, 401, Jsonrs.encode!(%{"code" => 10, "reason" => "No authorization cookie provided"}))
    end
  end
end
