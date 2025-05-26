defmodule Derailed.Contracts.Heartbeat do
  use Drops.Contract

  schema do
    %{
      required("sequence") => string()
    }
  end
end
