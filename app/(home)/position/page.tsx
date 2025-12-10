'use client'
import React, { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import DataTable, { Column } from '../../components/DataTable'
import { useReadContract } from 'wagmi'
import {abi, positionManagerAddr} from '../../abi'
import Button from '@mui/material/Button'
import ERC20Token from '@/app/components/ERC20Token'
import {formatEther} from 'viem'
import AddModal from './AddModal'
import usePairs from '@/app/hooks/usePairs'

interface PoolInfo {
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
  const {data, isLoading} = useReadContract({
    abi,
    address: positionManagerAddr,
    functionName: 'getAllPositions',
    args: [],
  })
  const {tokens} = usePairs();
  const columns: Column<PoolInfo>[] = [
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
      render: (_, record: PoolInfo)=>{
  
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
      render: (value: any, record: PoolInfo, index: number)=>{
        return `${record.tickLower}-${record.tickUpper}`
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
      render: (value) => (
        <Box >
          <Button variant="outlined" size="small"> View </Button>

        </Box>
      ),
    },
  ]
  return (
    <Box sx={{ pt: 2 }}>
      <DataTable
        header={<Box className=" flex justify-between p-2 items-center">
          <p className='text-2xl font-bold'>Position List</p>
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
      <AddModal open={openModa} handleClose={()=>setOpenModal(false)} />
    </Box>
  )
}

export default page
