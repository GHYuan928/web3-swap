import { useWriteContract, useConnection } from 'wagmi';
import {waitForTransactionReceipt} from '@wagmi/core'
import {config} from '../wagmi-config' 
import {abi} from '../abi'
// 自定义 Hook：代币授权
export function useApproval() {
  const { address } = useConnection()
  const { mutateAsync, isPending, error } = useWriteContract();
  const approve = async (tokenAddress: `0x${string}` ,spender: `0x${string}`, amount: bigint): Promise<boolean> => {
    try {
      if (!tokenAddress || !address) {
        throw new Error('请先连接钱包并选择代币');
      }
      
      const hash = await mutateAsync({
        address: tokenAddress,
        abi,
        functionName: 'approve',
        args: [spender, amount],
      });
      
      // 等待交易确认
      const receipt = await waitForTransactionReceipt(config,{ hash });
      
      return receipt.status === 'success';
      
    } catch (error: any) {
      console.error('授权失败:', error);
      throw new Error(error.shortMessage || error.message || '授权失败');
    }
  };
  
  return {
    approve,
    isPending,
    error,
  };
}
