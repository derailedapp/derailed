defmodule Derailed.DB.Guild.Member do
  use Ecto.Schema

  @primary_key false

  schema "guilds" do
    field(:user_id, :integer, primary_key: true)
    field(:guild_id, :integer, primary_key: true)
  end
end
