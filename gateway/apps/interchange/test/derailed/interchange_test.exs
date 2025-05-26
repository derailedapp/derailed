defmodule Derailed.InterchangeTest do
  use ExUnit.Case
  doctest Derailed.Interchange

  test "greets the world" do
    assert Derailed.Interchange.hello() == :world
  end
end
