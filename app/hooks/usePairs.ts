import {useState, useEffect, useMemo} from 'react'
import { useReadContract } from 'wagmi';
import { abi, poolManagerAddr } from '../abi';
import { fetchTokensFromPairs } from '../utils/erc20';

const usePars = ()=>{
  // 缓存 pairs 和 tokens 信息
  const [paris, setPairs] = useState<Record<string, any>[]>([]);
  const [tokens, setTokens] = useState<Record<string, Record<string, any>>>(()=> ({}));

  // 获取交易对
  const {data: originParis} = useReadContract({
    abi,
    address: poolManagerAddr,
    functionName: 'getPairs',
    args: [],
  })
  useEffect(()=>{
    const getPairs  = async()=>{
        const p = await fetchTokensFromPairs((originParis as Record<string, any>[]))
        console.log('fetched pairs:');
        // @ts-ignore
        setPairs(p.newPairs)
        // @ts-ignore
        // setSessionItem('pairs', JSON.stringify(p.newPairs));
        // @ts-ignore
        setTokens(p.tokenInfo)
        // @ts-ignore
        // setSessionItem('tokens', JSON.stringify(p.tokenInfo));
    }
    getPairs();
  },[originParis]);
  // 提取 token0s 且去重
  const pairToken0s = useMemo(()=>{
    const token0 = new Set<string>();
    paris?.forEach(pair=>{
      token0.add(pair.token0);
    })
    const token0Arr = Array.from(token0);
    const token0infos = token0Arr.map(t0=>{
      return {
        address: t0,
        name: paris.find(p=>p.token0 === t0)?.token0info?.name || 'Unknown',
        symbol: paris.find(p=>p.token0 === t0)?.token0info?.symbol || '???',
        decimals: paris.find(p=>p.token0 === t0)?.token0info?.decimals || 18,
      }
    })
    return token0infos;
  },[paris])
  
  const getPairToke1sFromToken0 = (token0: string)=>{  
    // 根据 token0 获取对应的 token1 列表
    const token1s = paris?.filter(p=>p.token0 === token0).map(p=>p.token1info);
    return token1s;
  }
  return {
    paris,
    tokens,
    originParis,
    pairToken0s,
    getPairToke1sFromToken0
  }
}
export default usePars;