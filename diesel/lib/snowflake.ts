var incr: number = 0;

function createSnowflake(): number {
  const currentMs = Date.now();

  var epoch = (currentMs - 1704067200000) << 22;
  epoch |= 1 % 32 << 17;
  epoch |= 1 % 32 << 12;
  epoch |= incr % 4096;

  if (incr === 9000000000) {
    incr = 0;
  }

  incr++;

  return epoch;
}
