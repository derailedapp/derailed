defmodule Derailed.Snowflake do
  @incr_table :snowflake_incr
  import Bitwise

  def initialize do
    :ets.new(@incr_table, [:named_table, read_concurrency: true])
    :ets.insert(@incr_table, {:incr, 1})
  end

  def create do
    current_ms = :os.system_time(:millisecond)
    epoch = (current_ms - 17_040_672_000_00) <<< 22
    epoch = epoch ||| rem(1, 32) <<< 17
    epoch = epoch ||| rem(1, 32) <<< 12

    [{:incr, incr}] = :ets.lookup(@incr_table, :incr)
    epoch = epoch ||| rem(incr, 4096)

    new_incr =
      if incr == 9_000_000_000 do
        1
      else
        incr + 1
      end

    :ets.insert(@incr_table, {:incr, new_incr})

    epoch
  end
end
