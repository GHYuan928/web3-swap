import React, { useMemo } from 'react'
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

// 兼容 address 和 token 对象两种传入方式
const ERC20Token = ({token}: {token: string|Record<string,any>}) => {

  if(typeof token == 'string' ){
      return <span>{token}</span>
  }
  return (
   <Tooltip title={token?.address} placement="top-start">
      <Button>{token?.symbol}</Button>
    </Tooltip>
  )
}

export default ERC20Token
