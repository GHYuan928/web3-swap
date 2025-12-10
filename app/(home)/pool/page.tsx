'use client'
import React, { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import DataTable, { Column } from '../../components/DataTable'
import { useReadContract } from 'wagmi'
import {abi, poolManagerAddr} from '../../abi'
import Button from '@mui/material/Button'
import AddModal from './AddModal'
import { sqrtPriceX96ToPrice, tickToPrice } from '@/app/utils'
import ERC20Token from '@/app/components/ERC20Token'
import usePairs from '@/app/hooks/usePairs'
import { formatEther } from 'viem'
interface PoolInfo {
  token0: string;
  token1: string;
  index: bigint;
  fee: number;
  tickLower: number;
  tickUpper: number;
  tick: number;
  sqrtPriceX96: bigint;
  liquidity: bigint;
}

const page = () => {
  const [openModa, setOpenModal] = useState(false)
  const {tokens} = usePairs();
  const {data, isLoading, refetch} = useReadContract({
    abi,
    address: poolManagerAddr,
    functionName: 'getAllPools',
    args: [],
  })
  console.log('pools data:', data);
  const onCloseModal = (flag?: boolean)=>{
    setOpenModal(false)
    if(flag){
      refetch()
    }
  }
  const columns: Column<PoolInfo>[] = [
    {
      title: 'Token',
      dataIndex: 'token0',
      key: 'token0',
      width: 370,
      render: (value: string)=>{
        return <ERC20Token token={tokens?.[value] || value} />
      }
    },
    {
      title: 'Token1',
      dataIndex: 'token1',
      key: 'token1',
       width: 370,
      render: (value: string)=>{
        return <ERC20Token token={tokens?.[value] || value} />
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
      render: (value: any, record: PoolInfo, index: number)=>{
        return `${tickToPrice(record.tickLower,18,18).toFixed(4)} - ${tickToPrice(record.tickUpper,18,18).toFixed(4)}`
      }
    },
    {
      title: 'Current Price',
      dataIndex: 'sqrtPriceX96',
      key: 'sqrtPriceX96',
      render: (value: any, record: PoolInfo)=>{
        return sqrtPriceX96ToPrice(value,18,18).toFixed(4)
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
  ]

  return (
    <Box sx={{ pt: 2 }}>
      <DataTable
        header={<Box className=" flex justify-between p-2 items-center">
          <p className='text-2xl font-bold'>Pool List</p>
          <Button variant="contained" onClick={()=>setOpenModal(true)}> Add </Button>
        </Box>}
        loading={isLoading}
        stickyHeader={true}
        columns={columns}
        dataSource={(data||[] )as PoolInfo[]}
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
