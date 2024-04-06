defmodule Derailed.API.Router.User do
  use Plug.Router
  import Ecto.Query

  plug(Plug.Logger)
  plug(:match)
  plug(:dispatch)

  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    length: 1_000_000,
    json_decoder: Jsonrs
  )

  post "/register" do
    {schema, root} =
      Derailed.Transformers.resolve_schema(%{
        "type" => "object",
        "properties" => %{
          "username" => %{
            "type" => "string",
            "maxLength" => 32,
            "minLength" => 3,
            "pattern" => "^[a-z0-9]+(?:[._][a-z0-9]+)*$"
          },
          "email" => %{
            "type" => "string",
            "maxLength" => 320,
            "minLength" => 5,
          },
          "password" => %{
            "type" => "string",
            "maxLength" => 100,
            "minLength" => 8,
          }
        },
        "required" => ["username", "email", "password"]
      })

    {:ok, body, _} = read_body(conn)

    data = Jsonrs.decode!(body)

    is_valid = ExJsonSchema.Validator.valid?(root, Map.new(data))

    if is_valid do
      user =
        Derailed.Repo.insert!(%Derailed.DB.User{
          id: Derailed.Snowflake.create(),
          username: data.username,
          email: data.email,
          password: Argon2.hash_pwd_salt(data.password),
          status: 1
        })

      token = Derailed.Token.generate_and_sign!(%{"user_id" => user.id})

      put_resp_cookie(conn, "authorization", token, http_only: true)
      send_resp(conn, 201, Jsonrs.encode!(Derailed.Transformers.user(user, false)))
    else
      send_resp(
        conn,
        400,
        Jsonrs.encode!(%{
          code: 1,
          reason: ExJsonSchema.Validator.validation_errors(root, schema, data)
        })
      )
    end
  end

  post "/login" do
    {schema, root} =
      Derailed.Transformers.resolve_schema(%{
        "type" => "object",
        "properties" => %{
          "email" => %{
            "type" => "string",
            "maxLength" => 320,
            "minLength" => 5,
            "pattern" => "^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$"
          },
          "password" => %{
            "type" => "string",
            "maxLength" => 100,
            "minLength" => 8,
            "pattern" => "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
          },
          "required" => ["email", "password"]
        }
      })

    is_valid = ExJsonSchema.Validator.valid?(root, conn.body_params)

    if is_valid do
      data = conn.body_params

      user = Derailed.Repo.one(from u in Derailed.DB.User, select: u, where: u.email == ^data.email)

      if is_nil(user) do
        send_resp(
          conn,
          400,
          Jsonrs.encode!(%{
            reason: "Email is unused"
          })
        )
      else
        password_is_valid = Argon2.verify_pass(
          data.password,
          user.password
        )

        if not password_is_valid do
          send_resp(
            conn,
            400,
            Jsonrs.encode!(%{
              reason: "Invalid password"
            })
          )
        else
          token = Derailed.Token.generate_and_sign!(%{"user_id" => user.id})

          send_resp(
            conn,
            400,
            Jsonrs.encode!(%{
              "token" => token
            })
          )
        end
      end
    else
      send_resp(
        conn,
        400,
        Jsonrs.encode!(%{
          code: 1,
          reason: ExJsonSchema.Validator.validation_errors(root, schema, conn.body_params)
        })
      )
    end
  end

  match _ do
    send_resp(conn, 404, Jsonrs.encode!(%{code: 0, reason: "Not Found"}))
  end
end
