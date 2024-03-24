defmodule Derailed.DB.Guild do
  use Ecto.Schema

  @primary_key {:id, :integer, autogenerate: false}

  schema "guilds" do
    field(:name, :string)
    field(:owner_id, :integer)
    field(:global_permissions, :integer)
  end
end
