import { swapRouterAddr, abi,  } from "@/app/abi";
import { useConnection, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from '@wagmi/core'
import { config } from '@/app/wagmi-config'
import { useApproval } from "./useApproval";
import { parseUnits } from "viem";
import { percentToBps } from "../utils/util";
import { useState } from "react";
import { toast } from "react-toastify";


type SwapParams = {
  token0Address: `0x${string}`,
  token1Address: `0x${string}`,
  value0: string;
  value1: string;
  pools: Record<string, any>[]
  slippageBps: number
}
const BPS_BASE = BigInt(10_000)

function useSwap(){
  const writeContract = useWriteContract()
  const { address} = useConnection();
  
  const {approve, isPending, error} =  useApproval()
  const [loading, setLoading] = useState(false)
  const swap = async (funcName: string, {token0Address,token1Address, value0,value1, pools,slippageBps}:SwapParams): Promise<boolean>=>{
    try {
      setLoading(true)
      const isInput = funcName.endsWith('Input')
      const amount =  isInput? parseUnits(value0,18): parseUnits(value0,18) * (BPS_BASE + percentToBps(slippageBps)) / BPS_BASE
      const token0ApproveReault = await approve(token0Address,swapRouterAddr,amount)
      if(token0ApproveReault === false){
        console.log('swapHandle: approve error')
        setLoading(false)
        return false
      }
      const data: Record<string,any> = {
        tokenIn: token0Address,
        tokenOut: token1Address,
        indexPath: pools.map(p=>p.index)||[],
        recipient: address,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 200),
      }
      if(isInput){
        const amountOutMinimum = parseUnits(value1,18) * (BPS_BASE - percentToBps(slippageBps)) / BPS_BASE
        data.amountOutMinimum = amountOutMinimum;
        data.amountIn = parseUnits(value0,18);
        data.sqrtPriceLimitX96 = BigInt(4295128740); //最小值+1  就是 tick 最小值 +1
      }else {
        data.amountOut = parseUnits(value1,18);
        const amountInMaximum = parseUnits(value0,18) * (BPS_BASE + percentToBps(slippageBps)) / BPS_BASE
        data.amountInMaximum = amountInMaximum;
        data.sqrtPriceLimitX96 = BigInt('1461446703485210103287273052203988822378723970341'); //最大值-1  就是 tick 最大值 -1
      }
      // 滑点
      console.log('swapHandle: func',funcName)
      console.log('swapHandle: data',data)
      const hash = await writeContract.mutateAsync({
        abi,
        address: swapRouterAddr,
        functionName: funcName,
        args: [data]
      })
      console.log('hash',hash)
      const receipt = await waitForTransactionReceipt(config,{hash})
      console.log('waitForTransactionReceipt',receipt)
      setLoading(false)
      if(receipt.status === 'success'){
        return true
      }
      return false
    } catch (error: any) {
      toast.error(error.shortMessage)
      setLoading(false)
      return false
    }
  }
  return {
    swap,
    loading
  }
}
export default useSwap