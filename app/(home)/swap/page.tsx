"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import usePars from "@/app/hooks/usePairs";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import TokenSelectInput from "@/app/components/TokenSelectInput";
import useSimulateContract from "@/app/hooks/useSimulateContract";
import usePools from "@/app/hooks/usePools";
import {parseUnits, formatEther} from 'viem'
import { swapRouterAddr } from "@/app/abi";

export default function SwapCard() {
  const [loading, setLoading] = useState(false)
  const {pairToken0s, getPairToke1sFromToken0} = usePars()

  // token0,token1数据源
  const [token0Source, setToken0Source] = useState<Record<string,any>[]>();
  const [token1Source, setToken1Source] = useState<Record<string,any>[]>();

  // token0 ，token1的值
  const [token0, setToken0] = useState<Record<string,any>>();
  const [token1, setToken1] = useState<Record<string,any>>();
  // 获取交易池子
  
  const { simulateContactFunc } =  useSimulateContract()
  const {getCurrentPools} = usePools()
  useEffect(()=>{
    // 初始化 
    if(pairToken0s.length){
      setToken0Source(pairToken0s)
      setToken0(pairToken0s[0])
      const token1s = getPairToke1sFromToken0(pairToken0s[0].address)
      setToken1Source(token1s)
      setToken1(token1s[0])
      // console.log('token0',pairToken0s[0])
      // console.log('token1',token1s[0])
      // console.log('token1s',token1s)
    }
  },[pairToken0s])

  const [value0, setValue0] = useState("");
  const [value1, setValue1] = useState("");
  const onToken0Select = (t: Record<string,any>)=>{
    console.log('000',t)
    setToken0(t)
    setValue0('') //选择token 一定要清空 数量
    setValue1('')
    const token1s = getPairToke1sFromToken0(t.address);
    setToken1(token1s[0])
    setToken1Source(token1s);
  }
  const onToken1Select = (t:Record<string,any>)=>{
    console.log('0001',t)
    setToken1(t)
    setValue0('') //选择token 一定要清空 数量
    setValue1('')
  }

  const onSimulateFunc = async (funcName: string)=>{
    if(!token0 || !token1){
      return 
    }
    setLoading(true)
    try {
      const curPool = getCurrentPools(token0.address, token1.address)
      // console.log('curPool',curPool)
      const indexPath = curPool.map(p=>p.index)
      const data =[{
        tokenIn: token0.address,
        tokenOut: token1.address,
        indexPath: indexPath,
        amountIn: parseUnits(value0,18),
        sqrtPriceLimitX96: 4295128740, // 汇率 最小值+1
      }];
      const {result} = await simulateContactFunc(swapRouterAddr,funcName,data)
      // res 数数量  赋值gei token2
      const amount = formatEther(result)
      return amount
    } catch (error) {
      
    }finally{
      setLoading(false)
    }
  }
  const onBlurAmount0 = (val:string)=>{
    // console.log('v',val)
    if(value0 || Number(value0)!=0){
      onSimulateFunc('quoteExactInput').then((amount)=>{
        amount && setValue1(amount)
      })
    }
  }
  const onBlurAmount1 = (val:string)=>{
    // console.log('v',val)
    if(value1 || Number(value1)!=0){
      onSimulateFunc('quoteExactOutput').then((amount)=>{
        amount && setValue0(amount)
      })
    }
  }
  const changeToken = ()=>{
    // token0 toke1互换
  }

  return (
    <Card className="max-w-md mx-auto mt-8 rounded-3xl shadow-2xl p-4" >
      <CardContent className="space-y-4">
        <Typography variant="h6">Swap</Typography>
        <TokenSelectInput amount={value0} token={token0} tokenSource={token0Source} onChangeAmount={setValue0} onBlurAmount={onBlurAmount0} onSelect={onToken0Select}/>
    
        {/* Swap button */}
        <Box className="flex justify-center">
          <IconButton className="bg-white shadow-md" onClick={changeToken}>
            <SwapVertIcon />
          </IconButton>
        </Box>

        {/* --- Input 1 --- */}
        <TokenSelectInput amount={value1} token={token1} tokenSource={token1Source} onChangeAmount={setValue1} onBlurAmount={onBlurAmount1} onSelect={onToken1Select}/>

        <Button variant="contained" fullWidth size="large" className="mt-4">
          Swap
        </Button>
      </CardContent>
      {loading && (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "inherit",
        zIndex: 10
      }}
    >
      <CircularProgress />
    </Box>
  )}
    </Card>
  );
}
