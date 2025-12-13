import { getConnection, simulateContract } from '@wagmi/core'
import { abi } from '../abi'
import { config } from '../wagmi-config'


const useSimulateContract = ()=>{
  const { connector } = getConnection(config)
  const simulateContactFunc = async (address: `0x${string}`,functionName: string, args: any[])=>{
    const result = await simulateContract(config, {
      abi,
      address,
      functionName,
      args,
      connector, 
    })
    return result
  }
  return {
    simulateContactFunc
  }
}
export default useSimulateContract