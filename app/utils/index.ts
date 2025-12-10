import { FormData } from '../interface/pool'
import { FEE_PERCENT_VALUE } from '../const'
import { TickMath } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'
const TICK_SPACING: Record<number, number> = {
  500: 10,
  3000: 60,
  10000: 200,
}

// price = token1/token0
export function priceToTick(price: number, decimals0: number, decimals1: number) {
  const adjustedPrice = price * 10 ** (decimals1 - decimals0)
  return Math.round(Math.log(adjustedPrice) / Math.log(1.0001))
}
export function tickToPrice(
  tick: number,
  decimals0: number,
  decimals1: number
) {
  const price =
    Math.pow(1.0001, tick) * Math.pow(10, decimals0 - decimals1)

  return price
}
export function tickToSqrtPriceX96(tick: number) {
  return TickMath.getSqrtRatioAtTick(tick) // Already JSBI
}

export function alignTickToSpacing(tick: number, tickSpacing: number) {
  return Math.floor(tick / tickSpacing) * tickSpacing
}

export function sqrtPriceX96ToPrice(
  sqrtPriceX96: bigint,
  decimals0: number,
  decimals1: number
) {
  const numerator = Number(sqrtPriceX96) ** 2 // sqrtPrice^2 = price in 2^192 space
  const denominator = 2 ** 192

  return (numerator / denominator) * 10 ** (decimals0 - decimals1)
}
export function convertFormDataToParams(formData: FormData, decimals0: number, decimals1: number) {
  // 1️⃣ fix: fee -> tickSpacing
  const fee = FEE_PERCENT_VALUE[formData.fee] || 3000
  const tickSpacing = TICK_SPACING[fee]

  // 2️⃣ fix: rename + tick from price input
  const currentPrice = Number(formData.sqrtPriceX96)
  const currentTick = priceToTick(currentPrice, decimals0, decimals1)
  const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(currentTick)

  // Range 转 tick
  let tickLower = priceToTick(Number(formData.tickLower), decimals0, decimals1)
  let tickUpper = priceToTick(Number(formData.tickUpper), decimals0, decimals1)

  // 3️⃣ fix: tick 对齐 spacing
  tickLower = alignTickToSpacing(tickLower, tickSpacing)
  tickUpper = alignTickToSpacing(tickUpper, tickSpacing)

  // 4️⃣ ensure lower < upper
  if (tickLower >= tickUpper) throw new Error("价格区间无效：下限必须小于上限")

  // 5️⃣ fix: token address must be sorted
  let token0 = formData.token0
  let token1 = formData.token1

  if (token0.toLowerCase() > token1.toLowerCase()) {
    [token0, token1] = [token1, token0]
  }

  // 6️⃣ ensure tick in proper range
  if (tickLower < TickMath.MIN_TICK || tickUpper > TickMath.MAX_TICK) {
    throw new Error("Tick 超出 Uniswap V3 允许范围")
  }

  console.info("Pool Params:", {
    token0, token1, fee, tickLower, tickUpper,
    sqrtPriceX96: sqrtPriceX96.toString()
  })

  return [{
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    sqrtPriceX96: BigInt(sqrtPriceX96.toString())
  }]
}
