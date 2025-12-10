import { multicall } from 'wagmi/actions'
import { erc20Abi } from 'viem'
import { config } from '../wagmi-config'

import {MNTokenA,
  MNTokenB,
  MNTokenC,
  MNTokenD} from '../const'
const getErc20name = (address: string) => {
  switch(address){
    case MNTokenA:
      return 'MNTokenA';
    case MNTokenB:
      return 'MNTokenB';
    case MNTokenC:
      return 'MNTokenC';
    case MNTokenD:
      return 'MNTokenD';
    default:
      return '';
  }
}


async function fetchTokensFromPairs(pairs: any[]) {
  // pair 示例 [{token0: '', token1: ''},...]  token0,token1 去重后获取 erc20 信息
  if(!pairs || pairs.length === 0) return [];
  const uniqueTokens = new Set<string>();
  pairs.forEach((pair) => {
    uniqueTokens.add(pair.token0);
    uniqueTokens.add(pair.token1);
  });
  const uniqueTokenList = Array.from(uniqueTokens);
  // 生成合约调用数组
  const calls = uniqueTokenList.flatMap((address) => [
    { address, abi: erc20Abi, functionName: 'name' },
    { address, abi: erc20Abi, functionName: 'symbol' },
    { address, abi: erc20Abi, functionName: 'decimals' },
  ]) ;

  // 执行 multicall

  const results = await multicall(config, {
    // @ts-ignore
    contracts: calls
  })
  const tokenInfo:Record<string,any> ={};
  uniqueTokenList.forEach((address, index) => {
    if(results[index * 3]?.result ){
      tokenInfo[address] = {
        name: results[index * 3]?.result || 'unknow',
        symbol: results[index * 3 + 1]?.result || '???',
        decimals: results[index * 3 + 2]?.result || 18,
        address
      }
    }
    
  })
  // 拼回数据

  const newPairs = pairs.filter((pair)=> tokenInfo[pair.token0] && tokenInfo[pair.token1]).map((pair) => {
    // result 为空就token取前4后5位
    const token0Info = tokenInfo[pair.token0];
    const token1Info = tokenInfo[pair.token1];
    const token0 = {
      address: pair.token0,
      name: token0Info.name,
      symbol: token0Info.symbol,
      decimals: token0Info.decimals,
    }
    const token1 = {
      address: pair.token1,
      name: token1Info.name,
      symbol: token1Info.symbol,
      decimals: token1Info.decimals,
    }
    return { ...pair, token0info: token0, token1info: token1 }
  })
  return {
    newPairs,
    tokenInfo
  }
}


export {
getErc20name,
fetchTokensFromPairs
}