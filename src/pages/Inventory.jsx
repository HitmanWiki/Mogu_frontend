// src/pages/Inventory.jsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import axios from 'axios';

export default function Inventory() {
    const { walletAddress } = useWallet();
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNFTs = async () => {
            if (!walletAddress) return;

            try {
                setLoading(true);
                const response = await axios.post('https://mogu-backend.vercel.app/api/inventory', {
                    wallet: walletAddress,
                });

                const nftList = response.data.nfts.map(nft => {
                    const rarity = getRarity(nft.metadata);
                    const boost = getBoostFromRarity(nft.metadata?.attributes);

                    return {
                        tokenId: parseInt(nft.tokenId, 16),
                        name: nft.name,
                        image: nft.image,
                        rarity,
                        boost,
                    };
                });

                setNfts(nftList);
            } catch (err) {
                console.error('Failed to load NFTs from backend:', err);
            } finally {
                setLoading(false);
            }
        };

        loadNFTs();
    }, [walletAddress]);

    const getRarity = (metadata) =>
        metadata?.attributes?.find(attr => attr.trait_type === 'rarity')?.value || 'Unknown';

    const getBoostFromRarity = (attributes = []) => {
        const rarity = attributes?.find(attr => attr.trait_type === 'rarity')?.value?.toLowerCase();
        switch (rarity) {
            case 'legendary': return 20;
            case 'epic': return 15;
            case 'rare': return 10;
            case 'common': return 5;
            default: return 0;
        }
    };

    const totalBoost = nfts.reduce((acc, nft) => acc + nft.boost, 0);

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-center text-purple-700 mb-6">🎒 Your MOGU Inventory</h1>

            {loading ? (
                <p className="text-center text-gray-500">Loading NFTs...</p>
            ) : nfts.length === 0 ? (
                <p className="text-center text-gray-500">You don't own any MOGU NFTs yet.</p>
            ) : (
                <>
                    <div className="text-center mb-6">
                        <p className="text-lg text-gray-700">
                            <strong>{nfts.length}</strong> NFTs owned • 🔋 Total Boost: <strong>{totalBoost}%</strong>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {nfts.map((nft, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-1 duration-300 p-4 text-center"
                            >
                                <img
                                    src={nft.image}
                                    alt={nft.name}
                                    className="w-full h-48 object-contain rounded-lg mb-3"
                                />
                                <h3 className="text-xl font-semibold text-gray-800">{nft.name}</h3>
                                <p className="text-sm text-gray-600">
                                    Rarity: <span className="font-bold text-purple-700">{nft.rarity}</span>
                                </p>
                                <p className="text-sm text-green-600">
                                    🔋 Boost: <strong>{nft.boost}%</strong>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Token ID: #{nft.tokenId}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
