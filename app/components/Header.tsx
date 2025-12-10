
'use client'
import React from 'react'
// import { ConnectButton } from '@rainbow-me/rainbowkit';
import ConnectButton from './ConnectWallet'
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';

// 将 links 数据提取到组件外部，避免每次渲染时重新创建
const HEADER_LINKS = [
  {
    name: 'Swap',
    url: '/swap'
  },
  {
    name: 'Pool',
    url: '/pool'
  },
  {
    name: 'Position',
    url: '/position'
  }
] as const

// 将 Box 的 sx 配置提取到组件外部
const boxSx = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  typography: 'body1',
  '& > :not(style) ~ :not(style)': {
    ml: 2,
  },
} as const

const HeaderComponent = () => {
  // 注意：在开发模式下，React Strict Mode 会故意双重渲染组件
  // 这是正常行为，用于检测副作用问题，生产环境下不会出现
  // 如果不需要调试日志，可以注释掉下面的 console.log
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_HEADER === 'true') {
    console.log('[Header] Rendered')
  }
  
  return (
    <div className=' w-full h-16 text-center shadow-2xs flex justify-center'>
      <div className=" w-6xl h-full flex items-center justify-between">
        <span className='text-2xl bg-linear-to-r from-primary to-green-500 bg-clip-text text-transparent leading-tight'>MetaNodeSwap</span>
        <Box sx={boxSx}>
          {HEADER_LINKS.map(link => (
            <Link key={link.name} href={link.url} underline="hover">
              {link.name}
            </Link>
          ))}
        </Box>
        <div className='glow min-w-[260px] sm:min-w-[300px]'>
          <ConnectButton />
        </div>
      </div>
    </div>
  )
}

// 使用 React.memo 并提供一个比较函数，确保只在必要时重新渲染
const Header = React.memo(HeaderComponent, () => {
  // 返回 true 表示 props 相同，不需要重新渲染
  // 但由于 Header 没有 props，这个比较函数实际上不会被调用
  // 我们使用 memo 主要是为了确保组件引用稳定
  return true
})

Header.displayName = 'Header'

export default Header
