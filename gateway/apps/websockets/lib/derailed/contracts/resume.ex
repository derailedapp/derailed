defmodule Derailed.Contracts.Resume do
  use Drops.Contract

  schema do
    %{
      required("token") => string(),
      required("session_id") => string()
    }
  end
end
