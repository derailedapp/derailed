defmodule Derailed.DB.User do
  use Ecto.Schema

  @primary_key {:id, :integer, autogenerate: false}

  schema "users" do
    field(:username, :string)
    field(:email, :string)
    field(:password, :string)
    field(:status, :integer)
  end
end
