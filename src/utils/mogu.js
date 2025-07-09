import { ethers } from "ethers";

// Your token contract address
const TOKEN_CA = "0x3b0b2d3ba68fed36732f2e36c06eb1ee44b6e50d";

// Only essential ABI for balance check
const TOKEN_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    }
];

export async function checkMoguBalance(walletAddress) {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum); // Ethers v6
        const contract = new ethers.Contract(TOKEN_CA, TOKEN_ABI, provider);

        const [rawBalance, decimals, symbol] = await Promise.all([
            contract.balanceOf(walletAddress),
            contract.decimals(),
            contract.symbol()
        ]);

        const formatted = ethers.formatUnits(rawBalance, decimals);
        console.log(`✅ ${walletAddress} holds ${formatted} ${symbol}`);
        return parseFloat(formatted);
    } catch (error) {
        console.error("❌ MOGU balance check failed:", error);
        return 0;
    }
}
