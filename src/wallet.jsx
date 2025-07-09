// src/wallet.jsx
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/ethereum'
import { WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const projectId = '6f5fd7faa128d369f81c8c280945a4ca' // Replace with your actual one

const metadata = {
    name: 'MOGUBOX',
    description: 'Win NFTs and stake MOGU!',
    url: 'https://localhost:5173',
    icons: ['https://yourdomain.com/icon.png'],
}

const chains = [mainnet, polygon, arbitrum]

const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata
})

createWeb3Modal({
    wagmiConfig,
    projectId,
    chains
})

const queryClient = new QueryClient()

export function WalletProvider({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
        </QueryClientProvider>
    )
}
