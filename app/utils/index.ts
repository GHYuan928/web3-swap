import { FormData } from '../interface/pool'
import { FEE_PERCENT_VALUE } from '../const'
import { TickMath } from '@uniswap/v3-sdk'
import JSBI from 'jsbi'

const Q96 = Math.pow(2, 96)

/**
 * @returns price to x96
 */
export function priceToSqrtPriceX96(
  price: number,
  decimals0: number,
  decimals1: number
): bigint {
  // decimals 修正
  const adjustedPrice = price * Math.pow(10, decimals1 - decimals0)

  const sqrtPrice = Math.sqrt(adjustedPrice)
  const sqrtPriceX96 = sqrtPrice * Q96

  return BigInt(Math.floor(sqrtPriceX96))
}
/**
 * @returns x96 to price
 */
export function sqrtPriceX96ToPrice(
  sqrtPriceX96: bigint,
): number {
  const Q96 = Math.pow(2, 96)

  const sqrtPrice = Number(sqrtPriceX96) / Q96
  const price = sqrtPrice * sqrtPrice
  return price
}

export function tickToPrice(tick: number){

  if(tick > TickMath.MAX_TICK){
    tick = TickMath.MAX_TICK
  }else if(tick < TickMath.MIN_TICK){
    tick = TickMath.MIN_TICK
  }
  const x96 = TickMath.getSqrtRatioAtTick(tick) // tick - x96

  const price = sqrtPriceX96ToPrice(BigInt(x96.toString())); // x96 - price
  return price;
}

export function convertFormDataToParams(formData: FormData, decimals0: number, decimals1: number) {
  // 1️⃣ fix: fee -> tickSpacing

  const fee = FEE_PERCENT_VALUE[formData.fee] || 3000

  // 2️ currntPrice:  currntPrice- x96(公式) price = (sqrtPriceX96 / 2^96) ^ 2
  const currentPriceX96 = priceToSqrtPriceX96(Number(formData.sqrtPriceX96),decimals0,decimals1)
  // const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(currentTick) // 去掉

  // 价格范围， price - x96（price = (sqrtPriceX96 / 2^96) ^ 2） - tick  JSBI
  // Range 转 tick
  const tickLowerX96 = priceToSqrtPriceX96(Number(formData.tickLower),decimals0,decimals1) // price - x96
  const tickLowerTick = TickMath.getTickAtSqrtRatio( JSBI.BigInt(Number(tickLowerX96)) ) // x96 - tick
  const tickUpperX96 = priceToSqrtPriceX96(Number(formData.tickUpper),decimals0,decimals1) // price - x96
  const tickUpperTick = TickMath.getTickAtSqrtRatio( JSBI.BigInt(Number(tickUpperX96)) ) // x96 - tick

  let token0 = formData.token0
  let token1 = formData.token1

  if (token0.toLowerCase() > token1.toLowerCase()) {
    [token0, token1] = [token1, token0]
  }

  if (tickLowerTick < TickMath.MIN_TICK || tickUpperTick > TickMath.MAX_TICK) {
    throw new Error("Tick 超出 Uniswap V3 允许范围")
  }

  return [{
    token0,
    token1,
    fee,
    tickLower :tickLowerTick,
    tickUpper: tickUpperTick,
    sqrtPriceX96: currentPriceX96
  }]
}
