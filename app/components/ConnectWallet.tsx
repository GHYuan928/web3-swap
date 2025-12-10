'use client'
import React from 'react'
import { useConnection } from 'wagmi'
import { Connection } from './Connection'
import { WalletOptions } from './WalletOption'

const ConnectWallet = () => {
  // 使用 useConnection 来检查连接状态，与 Connection 组件保持一致
  const { isConnected } = useConnection()

  if (isConnected) return <Connection />
  return <WalletOptions />
}

export default ConnectWallet
