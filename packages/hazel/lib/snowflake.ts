var incr: number = 1;

export function createSnowflake(): number {
  const currentMs = Date.now();

  var epoch = (currentMs - 1704067200000) << 22;
  epoch |= 1 % 32 << 17;
  epoch |= 1 % 32 << 12;
  epoch |= incr % 4096;

  if (incr === 9000000000) {
    incr = 1;
  }

  incr++;

  return epoch;
}
