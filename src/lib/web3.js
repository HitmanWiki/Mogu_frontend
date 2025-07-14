// src/lib/web3.js
import { createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum, base } from 'wagmi/chains';
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors';
import { http } from 'viem';

// ✅ Supported chains
export const supportedChains = [mainnet, polygon, arbitrum, base];

// ✅ Wagmi Config
export const config = createConfig({
    chains: supportedChains,
    transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [arbitrum.id]: http(),
        [base.id]: http(),
    },
    connectors: [
        injected(), // 🦊 MetaMask / Brave / Injected Wallets
        walletConnect({
            projectId: '6f5fd7faa128d369f81c8c280945a4ca', // Replace with actual WalletConnect project ID
        }),


    ],
    ssr: false,
});
