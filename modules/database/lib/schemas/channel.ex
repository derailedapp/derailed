defmodule Derailed.DB.Channel do
  use Ecto.Schema

  @primary_key {:id, :integer, autogenerate: false}

  schema "guilds" do
    field(:name, :string)
    field(:type, :integer)
    field(:guild_id, :integer)
    field(:last_message_id, :integer)
    field(:parent_id, :integer)
  end
end
