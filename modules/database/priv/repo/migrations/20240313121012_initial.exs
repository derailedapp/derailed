defmodule Derailed.Repo.Migrations.Initial do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :bigint, primary_key: true
      add :username, :string, size: 32, null: false
      add :email, :string, null: false
      add :password, :string, null: false
      add :status, :integer, null: false
    end
    create table(:guilds, primary_key: false) do
      add :id, :bigint, primary_key: true
      add :name, :string, size: 32
      add :owner_id, :bigint, null: false
      add :global_permissions, :bigint, null: false
    end
    create table(:guild_members) do
      add :guild_id, :bigint, primary_key: true
      add :user_id, :bigint, primary_key: true
    end
    create table(:invites, primary_key: false) do
      add :id, :string, primary_key: true
      add :guild_id, :bigint, null: false
      add :channel_id, :bigint
      add :author_id, :bigint
    end
    create table(:channels, primary_key: false) do
      add :id, :bigint, primary_key: true
      add :name, :string, size: 32
      add :type, :integer
      add :last_message_id, :bigint
      add :guild_id, :bigint
      add :parent_id, :bigint
    end
    create table(:messages, primary_key: false) do
      add :id, :bigint, primary_key: true
      add :author_id, :bigint
      add :channel_id, :bigint, null: false
      add :content, :string
      add :timestamp, :utc_datetime, null: false
      add :edited_timestamp, :utc_datetime
    end
    create table(:read_states) do
      add :channel_id, :bigint, primary_key: true
      add :user_id, :bigint, primary_key: true
      add :last_message_id, :bigint
    end
  end
end
