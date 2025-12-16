export function percentToBps(percent: number): bigint {
  return BigInt(Math.floor(percent * 100))
}