
'use client'
import React from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import '@rainbow-me/rainbowkit/styles.css';

import {config} from './wagmi-config'
// import {config} from './rainbowkit-config'

// 配置 QueryClient，禁用路由切换时的自动重新获取
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false, // 组件重新挂载时不重新获取
      refetchOnWindowFocus: false, // 窗口获得焦点时不重新获取
      refetchOnReconnect: false, // 网络重连时不重新获取
      staleTime: 5 * 60 * 1000, // 5分钟内数据不过期，避免频繁重新获取
    },
  },
})

interface ProviderProps {
  children: React.ReactNode,
}

const Provider:React.FC<ProviderProps> = ({children}:ProviderProps) => {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}> 
            {/* <RainbowKitProvider> */}
              {children}
            {/* </RainbowKitProvider> */}
          </QueryClientProvider>
        </WagmiProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default Provider

