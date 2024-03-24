# The MIT License (MIT)
#
# Copyright (c) 2021-2024 Masatoshi Nishiguchi
# Copyright (c) 2024-present VincentRPS
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

defmodule BitFlag do
  @moduledoc """
  A set of functions that manipulate bit flags.
  """

  import Bitwise, only: :functions

  @type state :: non_neg_integer | binary
  @type index :: non_neg_integer

  @doc """
  Converts state to a list of boolean values.

  ## Examples

      iex> parse(0b1010, 4)
      [false, true, false, true]

      iex> parse(<<0b1010>>, 4)
      [false, true, false, true]

  """
  @spec parse(state, pos_integer) :: list(boolean)
  def parse(state, size) when (is_integer(state) or is_binary(state)) and is_integer(size) do
    for index <- 0..(size - 1), do: on?(state, index)
  end

  @doc """
  Checks if the flag is turned on at a specified index.

  ## Examples

      iex> on?(0b0010, 1)
      true

      iex> on?(0b0010, 3)
      false

      iex> on?(<<0b0010>>, 1)
      true

      iex> on?(<<0b0010>>, 3)
      false

  """
  @spec on?(state, index) :: boolean
  def on?(state, index) when is_integer(state) and is_integer(index) do
    (state >>> index &&& 0x01) == 1
  end

  def on?(state, index) when is_binary(state) do
    state
    |> :binary.decode_unsigned()
    |> on?(index)
  end

  @doc """
  Checks if the flag is turned off at a specified index.

  ## Examples

      iex> off?(0b0001, 1)
      true

      iex> off?(0b0001, 0)
      false

      iex> off?(<<0b0001>>, 1)
      true

      iex> off?(<<0b0001>>, 0)
      false

  """
  @spec off?(state, index) :: boolean
  def off?(state, index), do: !on?(state, index)

  @doc """
  Turns on the flag at a specified index.

  ## Examples

      iex> on(0b0000, 2)
      0b0100

      iex> on(<<0b0000>>, 2)
      <<0b0100>>

  """
  @spec on(state, index) :: state
  def on(state, index) when is_integer(state) and is_integer(index) do
    state ||| 0x01 <<< index
  end

  def on(state, index) when is_binary(state) do
    state
    |> :binary.decode_unsigned()
    |> on(index)
    |> :binary.encode_unsigned()
  end

  @doc """
  Turns off the flag at a specified index.

  ## Examples

      iex> off(0b1111, 2)
      0b1011

      iex> off(<<0b1111>>, 2)
      <<0b1011>>

  """
  @spec off(state, index) :: state
  def off(state, index) when is_integer(state) and is_integer(index) do
    state &&& ~~~(0x01 <<< index)
  end

  def off(state, index) when is_binary(state) do
    state
    |> :binary.decode_unsigned()
    |> off(index)
    |> :binary.encode_unsigned()
  end
end
