# Licensed under ELv2 (Elastic License v2). Found in LICENSE.md in the project root.
# Copyright 2025 Derailed

defmodule Derailed.Contracts.Resume do
  use Drops.Contract

  schema do
    %{
      required("token") => string(),
      required("session_id") => string()
    }
  end
end
