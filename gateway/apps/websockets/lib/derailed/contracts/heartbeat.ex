# Licensed under AGPL-3.0. Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

defmodule Derailed.Contracts.Heartbeat do
  use Drops.Contract

  schema do
    %{
      required("sequence") => string()
    }
  end
end
