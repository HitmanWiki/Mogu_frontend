// useNFTBoost.js
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import nftAbi from '../abis/NFT_ABI.json';

const NFT_CONTRACT = "0x3265d34e9d04cce9bc30d1c012636d76959be6a7"; // your new NFT address on Base

export function useNFTBoost(signer, userAddress) {
    const [nftBoost, setNftBoost] = useState(0);
    const [nftDetails, setNftDetails] = useState([]);

    useEffect(() => {
        if (!signer || !userAddress) return;

        const fetchBoost = async () => {
            try {
                const nftContract = new ethers.Contract(NFT_CONTRACT, nftAbi, signer);
                const balance = await nftContract.balanceOf(userAddress);
                const owned = [];

                for (let i = 0; i < balance; i++) {
                    try {
                        // If tokenOfOwnerByIndex not available, fallback logic:
                        const tokenId = i; // or use a scanning method
                        const owner = await nftContract.ownerOf(tokenId);
                        if (owner.toLowerCase() === userAddress.toLowerCase()) {
                            const uri = await nftContract.tokenURI(tokenId);
                            const res = await fetch(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
                            const meta = await res.json();

                            let boost = 0;
                            if (meta.attributes.some(a => a.value === "Common")) boost = 7;
                            if (meta.attributes.some(a => a.value === "Rare")) boost = 15;
                            if (meta.attributes.some(a => a.value === "Legendary")) boost = 20;

                            owned.push({ tokenId, boost, name: meta.name });
                        }
                    } catch { }
                }

                // Average Boost:
                const totalBoost = owned.reduce((acc, nft) => acc + nft.boost, 0);
                const avgBoost = owned.length ? totalBoost / owned.length : 0;

                setNftBoost(Number(avgBoost));
                setNftDetails(owned);
            } catch (err) {
                console.error("NFT Boost Fetch Failed", err);
            }
        };

        fetchBoost();
    }, [signer, userAddress]);

    return { nftBoost, nftDetails };
}
