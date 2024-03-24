defmodule Derailed.API.Router.Guild do
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

  post "" do
    {schema, root} =
      Derailed.Transformers.resolve_schema(%{
        "type" => "object",
        "properties" => %{
          "name" => %{
            "type" => "string",
            "maxLength" => 32,
            "minLength" => 2
          },
          "global_permissions" => %{
            "type" => "integer"
          },
          "required" => ["name"]
        }
      })

    is_valid = ExJsonSchema.Validator.valid?(root, conn.body_params)

    if is_valid do
      data = conn.body_params

      {:ok, user} = Derailed.Transformers.authorize(conn)

      guild_count = Derailed.Repo.aggregate(from(m in Derailed.DB.Guild.Member, where: m.user_id == ^user.id), :count)

      if guild_count >= 100 do
        send_resp(
          conn,
          400,
          Jsonrs.encode!(%{
            reason: "maximum guild limit reached"
          })
        )
      else
        # TODO: dispatch a GUILD_CREATE event
        {:ok, guild} = Derailed.Repo.transaction(
          fn repo ->
            guild = repo.insert!(%Derailed.DB.Guild{
              id: Derailed.Snowflake.create(),
              name: data.name,
              owner_id: user.id,
              global_permissions: data.global_permissions
            })
            repo.insert!(%Derailed.DB.Guild.Member{
              user_id: user.id,
              guild_id: guild.id
            })
            parent_channel = repo.insert!(%Derailed.DB.Channel{
              id: Derailed.Snowflake.create(),
              name: "General",
              guild_id: guild.id,
              type: 0,
              parent_id: nil,
              last_message_id: nil
            })
            repo.insert!(%Derailed.DB.Channel{
              id: Derailed.Snowflake.create(),
              name: "general",
              guild_id: guild.id,
              type: 1,
              parent_id: parent_channel.id,
              last_message_id: nil
            })

            guild
          end
        )

        send_resp(
          conn,
          201,
          Jsonrs.encode!(guild)
        )
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

  patch "/:guild_id" do
    {schema, root} =
      Derailed.Transformers.resolve_schema(%{
        "type" => "object",
        "properties" => %{
          "name" => %{
            "type" => "string",
            "maxLength" => 32,
            "minLength" => 2
          },
          "global_permissions" => %{
            "type" => "integer"
          },
          "required" => []
        }
      })

    is_valid = ExJsonSchema.Validator.valid?(root, conn.body_params)

    if is_valid do
      guild = Derailed.Repo.get(Derailed.DB.Guild, guild_id)

      if is_nil(guild) do
        send_resp(
          conn,
          404,
          Jsonrs.encode!(%{
            reason: "No guild with this ID exists"
          })
        )
      else
        # TODO!
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
