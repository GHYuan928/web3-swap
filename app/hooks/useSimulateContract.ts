import { getConnection, simulateContract } from '@wagmi/core'
import { abi, swapRouterAddr } from '../abi'
import { config } from '../wagmi-config'
import { parseUnits } from 'viem'

interface SimulateParams {
  functionName: string, 
  pools: Record<string,any>[] ,
  token0Address: `0x${string}`,
  token1Address: `0x${string}`,
  value0: string,
  value1: string,
}

const useSimulateContract = ()=>{
  const { connector } = getConnection(config)
  const simulateContactFunc = async ({functionName,pools, token0Address,token1Address,value0,value1}:SimulateParams)=>{
    const isInput = functionName.endsWith('Input')
    const indexPath = pools.map(p=>p.index)
    const data: Record<string, any> ={
      tokenIn: token0Address,
      tokenOut: token1Address,
      indexPath: indexPath,
      sqrtPriceLimitX96: 4295128740, // 汇率 最小值+1
    };
    if(isInput && value0){
      data.amountIn = parseUnits(value0,18);
    }else if(!isInput && value1){
      data.amountOut = parseUnits(value1,18)
    }else {
      return null
    }
    console.log('similate data:',data)
    const result = await simulateContract(config, {
      abi,
      address: swapRouterAddr,
      functionName,
      args: [data],
      connector, 
    })
    return result
  }
  return {
    simulateContactFunc
  }
}
export default useSimulateContract