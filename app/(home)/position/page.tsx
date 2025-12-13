'use client'
import React, { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import DataTable, { Column } from '../../components/DataTable'
import { useReadContract, useWriteContract } from 'wagmi'
import {abi, positionManagerAddr} from '../../abi'
import Button from '@mui/material/Button'
import ERC20Token from '@/app/components/ERC20Token'
import {formatEther} from 'viem'
import AddModal from './AddModal'
import usePairs from '@/app/hooks/usePairs'
import { tickToPrice } from '@/app/utils'
import Stack from '@mui/material/Stack'
import { waitForTransactionReceipt } from '@wagmi/core'

import { config } from '../../wagmi-config'
import { toast } from 'react-toastify'


interface PositonInfo {
  id: number,
  owner: string;
  token0: string;
  token1: string;
  index: bigint;
  fee: number;
  tickLower: number;
  tickUpper: number;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  liquidity: bigint;
}

const page = () => {
  const [openModa, setOpenModal] = useState(false)
  const {data, isLoading, refetch} = useReadContract({
    abi,
    address: positionManagerAddr,
    functionName: 'getAllPositions',
    args: [],
  })
  console.log('getAllPositions',data)
  const writeContract = useWriteContract()
  const onCloseModal = (flag?: boolean)=>{
    setOpenModal(false)
    if(flag){
      refetch()
    }
  }
  const {tokens} = usePairs();
  const onCellect = async (record: PositonInfo)=>{
    const data = [BigInt(record.id), record.owner]
    console.log('collect params',data)
    const h = await writeContract.mutateAsync({ 
            abi,
            address: positionManagerAddr,
            functionName: 'collect',
            args: data,
          })
    console.log('collect hash',h)
    const receipt = await waitForTransactionReceipt(config,{hash:h})
    console.log('collect receipt',receipt)
    if(receipt.status === 'success'){
      toast.success('Collect Success')
    }else {
      toast.error('Collect Failed')
    }
    
  }
  const onRemove = async (record: PositonInfo)=>{
    try{
      const data = [BigInt(record.id)]
      console.log('burn params',data)
      const h = await writeContract.mutateAsync({ 
              abi,
              address: positionManagerAddr,
              functionName: 'burn',
              args: data,
            })
      console.log('burn hash',h)
      const receipt = await waitForTransactionReceipt(config,{hash:h})
      console.log('burn receipt',receipt)
      if(receipt.status === 'success'){
        toast.success('Remove Success')
      }else {
        toast.error('Remove Failed')
      }
    } catch (err: any) {
      console.error('burn error:', err)
      toast.error(err.shortMessage || 'Burn Failed')
    }
    
  }
  const onView = (record: PositonInfo)=>{
    const options = {
      method: 'POST',
      headers: {accept: 'application/json', 'content-type': 'application/json'},
      body: JSON.stringify({
        id: 1,
        jsonrpc: '2.0',
        method: 'zan_getNFTsByOwner',
        params: [record.owner, 'ERC721', 100, 1]
      })
    };

    fetch('https://api.zan.top/data/v1/eth/mainnet/public', options)
      .then(res => res.json())
      .then(res => console.log(res))
      .catch(err => console.error(err));
  }
  const columns: Column<PositonInfo>[] = [
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      width: 370,
      render: (value: string)=>{
        return `${value.slice(0, 6)}...${value.slice(-6)}`
      }
    },
    {
      title: 'Token',
      dataIndex: 'token0',
      key: 'token0',
      width: 360,
      render: (_, record: PositonInfo)=>{
  
        return <>
        <ERC20Token token={tokens?.[record.token0] || record.token0} />({Number(formatEther(record.tokensOwed0)).toFixed(4)})
        -
        <ERC20Token token={tokens?.[record.token1 ] || record.token1} />({Number(formatEther(record.tokensOwed1)).toFixed(4)})
        </>
      }
    },
    {
      title: 'Fee Tier',
      dataIndex: 'fee',
      key: 'fee',
      render: (value) => `${value / 10000}%`
    },
    {
      title: 'Set Price Range',
      dataIndex: 'setPriceRange',
      key: 'setPriceRange',
      render: (value: any, record: PositonInfo, index: number)=>{
        return `${tickToPrice(record.tickLower,18,18).toFixed(4)} - ${tickToPrice(record.tickUpper,18,18).toFixed(4)}`
        
      }
    },
    {
      title: 'Liquidity',
      dataIndex: 'liquidity',
      key: 'liquidity',
      render: (value) => (
        <Box sx={{ fontWeight: 'bold', color: 'primary.main' }}>
         {Number(formatEther(value)).toFixed(4)}
        </Box>
      ),
    },
    {
      title: 'operations',
      dataIndex: 'operations',
      key: 'operations',
      width: '300',
      render: (_, record: PositonInfo) => (
        <Stack direction="row" spacing={0.5}>
          {/* <Button variant="outlined" size="small" onClick={()=>onView(record)}> View </Button> */}
          <Button variant="outlined" size="small" onClick={()=>onRemove(record)}> Remove </Button>
          <Button variant="outlined" size="small" onClick={()=>onCellect(record)}> Collect </Button>
        </Stack>
      ),
    },
  ]
  return (
    <Box sx={{ pt: 2 }}>
      <DataTable
        header={<Box className=" flex justify-between p-2 items-center">
          <p className='text-2xl font-bold'>Position List</p>
          <Button disabled={isLoading} variant="contained" onClick={()=>setOpenModal(true)}> Add </Button>
        </Box>}
        loading={isLoading}
        stickyHeader={true}
        columns={columns}
        dataSource={(data||[] )as PositonInfo[]}
        rowKey="id"
        pagination={{
          pageSize: 100,
          pageSizeOptions: [5, 10, 20,50,100],
        }}
        sx={{ px: 2 }}
      />
      <AddModal open={openModa} handleClose={onCloseModal} />
    </Box>
  )
}

export default page
