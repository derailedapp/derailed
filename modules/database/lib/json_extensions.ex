defimpl Jsonrs.Encoder, for: [MapSet, Range, Stream] do
  def encode(struct), do: Enum.to_list(struct)
end

defimpl Jsonrs.Encoder, for: [Struct] do
  def encode(struct), do: Map.delete(Map.from_struct(struct), :__meta__)
end
