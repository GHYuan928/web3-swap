

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {  mainnet, polygon, optimism, arbitrum, base, sepolia } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: '95b55679d39c9662807e7faa6fbbf2e9',
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
export {
  config
}