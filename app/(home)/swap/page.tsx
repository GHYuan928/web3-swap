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
import { formatEther} from 'viem'
import SlippageSelector from "@/app/components/SlippageSelector";
import useSwap from "@/app/hooks/useSwap";
import { toast } from "react-toastify";

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
  const { getCurrentPools } = usePools()
  const {swap, loading:swapLoading} = useSwap()
  // token 数量 及 滑点
  const [value0, setValue0] = useState("");
  const [value1, setValue1] = useState("");
  const [slippageBps, setSlippageBps] = useState<number>(0)
  const slippageOptions = useMemo(()=> [{name: '0.1%',value: 0.001},{name: '0.3%',value: 0.003},{name: '0.5%',value: 0.005},{name: '1%',value: 0.01}],[])
  const [isInput, setIsInput] = useState(true)
  useEffect(()=>{
    // 初始化 
    if(pairToken0s.length){
      setToken0Source(pairToken0s)
      setToken0(pairToken0s[0])
      const token1s = getPairToke1sFromToken0(pairToken0s[0].address)
      setToken1Source(token1s)
      setToken1(token1s[0])
    }
  },[pairToken0s])

  
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

  // 预估 token 数量
  const onSimulateFunc = async (funcName: string)=>{
    if(!token0 || !token1){
      return 
    }
    setLoading(true)
    try {
      const curPool = getCurrentPools(token0.address, token1.address)
      // console.log('curPool',curPool)
      const simulateResult = await simulateContactFunc({
        functionName: funcName,
        pools: curPool,
        token0Address: token0.address, 
        token1Address: token1.address,
        value0,
        value1
      })
      console.log('simulateResult',simulateResult)
      if(!simulateResult){
        return;
      }
      // res 数数量  赋值gei token2
      const amount = formatEther(simulateResult.result)
      return amount
    } catch (error) {
      
    }finally{
      setLoading(false)
    }
  }
  const onBlurAmount0 = (val:string)=>{
    if(value0 || Number(value0)!=0){
      setIsInput(true)
      onSimulateFunc('quoteExactInput').then((amount)=>{
        amount && setValue1(amount)
      })
    }
  }
  const onBlurAmount1 = (val:string)=>{
    if(value1 || Number(value1)!=0){
      setIsInput(false)
      onSimulateFunc('quoteExactOutput').then((amount)=>{
        amount && setValue0(amount)
      })
    }
  }
  const changeToken = ()=>{
    // token0 toke1互换
  }
  const swapHandle = async ()=>{

    if(!token0 || !token1 || !value0|| !value1){
      return;
    } 
    const funcName = isInput ? 'exactInput':'exactOutput'
    const curPool = getCurrentPools(token0.address, token1.address)

    const res = await swap(funcName,{
      token0Address: token0.address,
      token1Address: token1.address,
      value0, value1, 
      pools: curPool, 
      slippageBps
    })
    if(res){
      toast.success('swap success')
    }
  }
  const onSlippageValueChange = (v: number)=>{
    setSlippageBps(v)
  }
  return (
    <Card className="max-w-md mx-auto mt-8 rounded-3xl shadow-2xl p-4" >
      <CardContent className="space-y-4">
        <Typography variant="h6">Swap</Typography>
        <TokenSelectInput amount={value0} token={token0} tokenSource={token0Source} onChangeAmount={setValue0} onBlurAmount={onBlurAmount0} onSelect={onToken0Select} />
          
        {/* Swap button */}
        <Box className="flex justify-center">
          <IconButton className="bg-white shadow-md" onClick={changeToken}>
            <SwapVertIcon />
          </IconButton>
        </Box>

        {/* --- Input 1 --- */}
        <TokenSelectInput amount={value1} token={token1} tokenSource={token1Source} onChangeAmount={setValue1} onBlurAmount={onBlurAmount1} onSelect={onToken1Select}/>
        <Box className="flex items-center mt-4">
          <span>滑点容忍度</span>
          <SlippageSelector options={slippageOptions} onValueChange={onSlippageValueChange}/>
        </Box>
        <Button variant="contained" fullWidth size="large" className="mt-4" onClick={swapHandle} loading={swapLoading}>
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
