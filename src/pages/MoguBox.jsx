import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';
import { checkMoguBalance } from '../utils/mogu';
import { getMoguBoxContract } from '../utils/moguBoxContract';


import { useWallet } from '../context/WalletContext';
import './MoguBox.css';
import MOGU_ABI from '../abis/MOGU_ABI.json';
import { ethers } from 'ethers';
import MOGUBOX_ABI from '../abis/MOGUBOX_ABI.json';

const TOKEN_ADDRESS = "0x3b0b2d3ba68fed36732f2e36c06eb1ee44b6e50d";
const MOGUBOX_ADDRESS = "0x8774276b89036210febf98de6e0d4aef3388c8fc";
const TOKEN_DECIMALS = 18;
const COST_TO_OPEN = "1000";

const fetchNFTMetadata = async (uri) => {
    try {
        const metadataUri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const response = await fetch(metadataUri);
        const metadata = await response.json();

        // Fix the image field inside metadata
        if (metadata.image?.startsWith("ipfs://")) {
            metadata.image = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
        }

        return metadata;
    } catch (error) {
        console.error("❌ Failed to fetch metadata:", error);
        return null;
    }
};


export default function MoguBox() {
    const { walletAddress } = useWallet();

    const [isOpening, setIsOpening] = useState(false);
    const [nftImage, setNftImage] = useState(null);
    const [nftName, setNftName] = useState("");
    const [nftRarity, setNftRarity] = useState("");
    const [nftBoost, setNftBoost] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);
    const [recentRewards, setRecentRewards] = useState([]);

    const fetchRewards = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(MOGUBOX_ADDRESS, MOGUBOX_ABI, provider);
        const rewards = await contract.getRewards(10);
        const updatedRewards = await Promise.all(
            rewards.map(async (reward) => {
                const metadata = await fetchNFTMetadata(reward.tokenURI);
                return {
                    ...reward,
                    image: metadata?.image || '',
                    name: metadata?.name || 'Unknown',
                    rarity: metadata?.attributes?.find(attr => attr.trait_type === 'Rarity')?.value || 'Unknown',
                    boost: metadata?.attributes?.find(attr => attr.trait_type === 'Staking Boost')?.value || ''

                };
            })
        );
        setRecentRewards(updatedRewards);
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    useEffect(() => {
        const verifyMoguBalance = async () => {
            if (!walletAddress) return;

            const balance = await checkMoguBalance(walletAddress);
            console.log("✅ MOGU Balance:", balance);

            if (balance <= 0) {
                toast.error("❌ You need MOGU tokens to open the box!");
            } else {
                toast.success("🎉 MOGU token verified!");
            }
        };

        verifyMoguBalance();
    }, [walletAddress]);

    const openBox = async () => {
        if (!walletAddress) {
            toast.warning("⚠️ Connect your wallet first!");
            return;
        }

        const balance = await checkMoguBalance(walletAddress);
        if (balance <= 0) {
            toast.error("❌ You must hold MOGU tokens to open the box!");
            return;
        }

        try {
            setIsOpening(true);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const tokenContract = new ethers.Contract(TOKEN_ADDRESS, MOGU_ABI, signer);
            const moguBoxContract = new ethers.Contract(MOGUBOX_ADDRESS, MOGUBOX_ABI, signer);

            const amount = ethers.parseUnits(COST_TO_OPEN, TOKEN_DECIMALS);
            const allowance = await tokenContract.allowance(walletAddress, MOGUBOX_ADDRESS);
            console.log("🔐 Current allowance:", ethers.formatUnits(allowance, TOKEN_DECIMALS));

            if (allowance < amount) {
                toast.info("🧾 Approving token allowance...");
                const approveTx = await tokenContract.approve(MOGUBOX_ADDRESS, amount);
                console.log("✅ Approve TX hash:", approveTx.hash);
                await approveTx.wait();
                toast.success("✅ Approval successful!");
            }

            toast.info("🎁 Opening the MOGU Box...");
            const tx = await moguBoxContract.openBox();
            const receipt = await tx.wait();

            console.log("📦 MOGUBOX Opened TX:", tx.hash);
            toast.success("🎉 Box opened! NFT should be minted.");

            await fetchRewards();

            const last = recentRewards[0];
            if (last) {
                setNftImage(last.image);
                setNftName(last.name);
                setNftRarity(last.rarity);
                setNftBoost(last.boost);
                setShowConfetti(true);
                toast.success(`🎉 Minted ${last.rarity} NFT!`);
            }
        } catch (err) {
            console.error("❌ Error opening box:", err);
            toast.error("❌ Something went wrong opening the MOGUBOX!");
        } finally {
            setIsOpening(false);
        }
    };

    if (!walletAddress) {
        return (
            <div className="flex flex-col items-center justify-center mt-12">
                <h2 className="text-2xl font-bold text-red-600">
                    ⚠️ Please connect your wallet to access the MOGUBOX!
                </h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center mt-12 w-full max-w-xl relative px-4">
            {showConfetti && <Confetti numberOfPieces={250} recycle={false} />}

            <motion.h2
                className="text-4xl font-extrabold mb-2 text-purple-800 drop-shadow"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                🎁 Open a MOGUBOX
            </motion.h2>

            <p className="mb-6 text-center text-purple-700">
                Spend <span className="font-semibold text-purple-600">$MOGU</span> to win NFTs and boost your staking rewards.
            </p>

            <motion.button
                onClick={openBox}
                className="bg-yellow-400 text-purple px-6 py-3 rounded-full text-lg font-bold shadow-lg hover:bg-yellow-500 transition duration-300"
                disabled={isOpening}
                whileTap={{ scale: 0.95 }}
            >
                {isOpening ? 'Opening...' : 'Open MOGUBOX'}
            </motion.button>

            {isOpening && (
                <div className="mt-10 animate-bounce">
                    <img src="/box.gif" alt="Opening box..." className="w-40 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Unleashing the mystery... 🎇</p>
                </div>
            )}

            {nftImage && (
                <motion.div
                    className="nft-reveal-box"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                >
                    <h3>🎉 Congrats! You minted:</h3>
                    <img src={nftImage} alt="NFT" className="w-40 mx-auto mt-4" />
                    <p className="text-xl font-semibold mt-2">{nftName}</p>
                    <p className={`text-md font-medium mt-1 rarity-${nftRarity.toLowerCase()}`}>{nftRarity} Rarity</p>
                    {nftBoost && <p className="text-sm text-green-600 mt-1">🔥Boost: {nftBoost}</p>}
                </motion.div>
            )}

            <div className="recent-rewards">
                <h4 className="rewards-title">🧾 Last 10 Rewards</h4>
                {recentRewards.length === 0 ? (
                    <p className="rewards-empty">No rewards yet. Open a box to start your collection!</p>
                ) : (
                    <ul className="rewards-list">
                        {recentRewards.map((reward, index) => (
                            <li key={index} className="reward-item flex items-center gap-3 p-3 bg-white rounded shadow mb-3">
                                <img
                                    src={reward.image}
                                    alt={reward.name}
                                    className="reward-img"
                                    onError={(e) => (e.target.src = "/placeholder.webp")} // fallback image
                                />
                                <div className="reward-info">
                                    <p className="reward-name font-semibold text-lg">{reward.name}</p>
                                    <p className={`reward-meta rarity-${reward.rarity.toLowerCase()}`}>{reward.rarity} Rarity</p>
                                    {reward.boost && (
                                        <p className="reward-boost text-green-600 text-sm">🔥 {reward.boost}</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
