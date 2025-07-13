import React, { useEffect, useState } from 'react';
import { useWallet } from '../context/WalletContext';
import axios from 'axios';
import './Inventory.css';
import { ethers } from 'ethers';
import { useNFTBoost } from '../hooks/useNFTBoost';

export default function Inventory() {
    const { walletAddress } = useWallet();
    const [nfts, setNfts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [signer, setSigner] = useState(null);

    // ✅ Setup signer and pass it into useNFTBoost
    useEffect(() => {
        const initSigner = async () => {
            if (window.ethereum && walletAddress) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const _signer = await provider.getSigner();
                setSigner(_signer);
            }
        };
        initSigner();
    }, [walletAddress]);

    const { nftBoost } = useNFTBoost(signer, walletAddress); // ✅ Now works!

    useEffect(() => {
        if (!walletAddress) return;

        const fetchNFTs = async () => {
            try {
                setLoading(true);

                const res = await axios.post('https://mogu-backend.vercel.app/api/inventory', {
                    wallet: walletAddress,
                });

                const rawNFTs = res.data.nfts;

                const defaultNfts = rawNFTs.map((nft, index) => {
                    const tokenId = parseInt(nft.tokenId, 16);
                    const defaultRarity = getDefaultRarity(index);
                    const defaultBoost = getDefaultBoost(defaultRarity);

                    return {
                        tokenId,
                        image: nft.image,
                        name: `MOGU NFT #${tokenId}`,
                        rarity: defaultRarity,
                        boost: defaultBoost,
                    };
                });

                setNfts(defaultNfts);
            } catch (err) {
                console.error('❌ Error fetching NFTs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNFTs();
    }, [walletAddress]);

    const getDefaultRarity = (index) => {
        if (index % 10 === 0) return 'Legendary';
        if (index % 5 === 0) return 'Epic';
        if (index % 3 === 0) return 'Rare';
        return 'Common';
    };

    const getDefaultBoost = (rarity) => {
        switch (rarity.toLowerCase()) {
            case 'legendary': return 20;
            case 'epic': return 15;
            case 'rare': return 10;
            case 'common': return 5;
            default: return 0;
        }
    };

    return (
        <div className="inventory-container">
            <h1 className="inventory-heading">🎒 Your MOGU Inventory</h1>

            {loading ? (
                <p className="inventory-loading">Loading NFTs...</p>
            ) : nfts.length === 0 ? (
                <p className="inventory-empty">You don't own any MOGU NFTs yet.</p>
            ) : (
                <>
                    <div className="boost-summary">
                        <p>
                            <strong>{nfts.length}</strong> NFTs owned • 🧬 Staking Boost: <strong>{nftBoost.toFixed(2)}%</strong>
                        </p>
                    </div>

                    <div className="nft-grid">
                        {nfts.map((nft, idx) => (
                            <div key={idx} className="nft-card">
                                <img
                                    src={nft.image}
                                    alt={nft.name}
                                    className="nft-image"
                                    onError={(e) => e.target.src = '/placeholder.webp'}
                                />
                                <h3 className="nft-title">{nft.name}</h3>
                                <p className="nft-rarity">
                                    Rarity: <span>{nft.rarity}</span>
                                </p>
                                <p className="nft-boost">
                                    🧬 Boost: <strong>{nft.boost}%</strong>
                                </p>
                                <p className="nft-id">Token ID: #{nft.tokenId}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
