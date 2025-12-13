import { abi, poolManagerAddr } from '../abi'
import { useReadContract } from "wagmi";
const usePools = ()=>{
  const {data: pools} = useReadContract({
      abi,
      address: poolManagerAddr,
      functionName: 'getAllPools',
      args: [],
    }) as { data: Record<string,any>[] }
  
  const getCurrentPools = (token0: `0x${string}`,token1: `0x${string}`)=>{
    const curPools = pools?.filter((p: any)=>{
        return p.token0 === token0 && p.token1 === token1
      })
    return curPools||[]
  }
  
  return {
    pools,
    getCurrentPools
  }
}
export default usePools