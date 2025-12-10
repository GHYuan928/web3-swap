'use client'
import Button from '@mui/material/Button'
import { useConnection, useDisconnect, useBalance } from 'wagmi'
import { formatEther } from 'viem'

export function Connection() {
  const { address } = useConnection()
  console.log('address',address)
  const { data: balance } = useBalance({
    address: address,
  })
  
  const { mutate, isPending } = useDisconnect({
    mutation: {
      onSuccess() {
        console.log('已断开')
      },
      onError(err) {
        console.error(err)
      },
    }
  })

  return (
    <div className='flex items-center'>
      {/* address 展示 前6后4位 */ }
      {address && <div>{address.slice(0, 6)}...{address.slice(-4)}</div>}
      {/** balance 保留3位小数 */}
      <div className='ml-2'>{ balance?.value && Number(formatEther(balance?.value)).toFixed(3)} - {balance?.symbol}</div>
      <Button onClick={() => mutate()} disabled={isPending}>
        {isPending ? '断开中...' : '断开'}
      </Button>

    </div>
  )
}