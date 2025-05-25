defmodule Derailed.Contracts.Identify do
  use Drops.Contract

  schema do
    %{
      required("token") => string()
    }
  end
end
