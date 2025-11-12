import { http } from 'wagmi';
import { sepolia, hardhat, mainnet } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Note: For production, get a free WalletConnect projectId from https://cloud.walletconnect.com
// For local development, this placeholder works fine
export const config = getDefaultConfig({
  appName: 'Power Usage Log - FHE Encrypted',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'POWER_USAGE_LOG_FHE',
  chains: [
    hardhat,
    sepolia,
    ...(process.env.NODE_ENV === 'development' ? [mainnet] : [])
  ],
  transports: {
    [hardhat.id]: http('http://localhost:8545'),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_INFURA_URL || `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_INFURA_URL || `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
  },
  ssr: true, // Enable server-side rendering support
});


