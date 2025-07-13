// src/pages/Staking.jsx
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { useNFTBoost } from '../hooks/useNFTBoost';
import './Staking.css';

import stakingAbi from "../abis/stakingAbi.json";
import tokenAbi from "../abis/MOGU_ABI.json";
import { setBoostAPI } from "../utils/setBoost";


const STAKING_CONTRACT = "0xd949c3bad89cff9fd8b08a007e3e0e763a673c75";
const TOKEN_CONTRACT = "0x3b0b2D3ba68Fed36732F2e36C06eB1ee44B6e50D";

export default function Staking() {
    const { walletAddress } = useWallet();


    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [stakingContract, setStakingContract] = useState(null);
    const [tokenContract, setTokenContract] = useState(null);

    const { nftBoost, nftDetails } = useNFTBoost(signer, walletAddress);

    const [balance, setBalance] = useState("0");
    const [stakedAmount, setStakedAmount] = useState("0");
    const [rewards, setRewards] = useState("0");
    const [unlockTime, setUnlockTime] = useState(0);
    const [inputAmount, setInputAmount] = useState("");
    const [apy, setApy] = useState("0");
    const [penalty, setPenalty] = useState("0");
    const [lockPeriod, setLockPeriod] = useState(0);

    useEffect(() => {
        const init = async () => {
            if (window.ethereum && walletAddress) {
                const _provider = new ethers.BrowserProvider(window.ethereum);
                const _signer = await _provider.getSigner();
                const staking = new ethers.Contract(STAKING_CONTRACT, stakingAbi, _signer);
                const token = new ethers.Contract(TOKEN_CONTRACT, tokenAbi, _signer);

                setProvider(_provider);
                setSigner(_signer);
                setStakingContract(staking);
                setTokenContract(token);
            }
        };
        init();
    }, [walletAddress]);

    useEffect(() => {
        const fetchData = async () => {
            if (!stakingContract || !tokenContract || !walletAddress) return;

            const bal = await tokenContract.balanceOf(walletAddress);
            const staked = await stakingContract.userInfo(walletAddress);
            const rew = await stakingContract.pendingReward(walletAddress);
            const unlock = await stakingContract.holderUnlockTime(walletAddress);
            const apy = await stakingContract.apy();
            const penalty = await stakingContract.exitPenaltyPerc();
            const lock = await stakingContract.lockDuration();

            setBalance(ethers.formatUnits(bal, 18));
            setStakedAmount(ethers.formatUnits(staked.amount, 18));
            setRewards(ethers.formatUnits(rew, 18));
            setUnlockTime(Number(unlock));
            setApy(apy.toString());
            setPenalty(penalty.toString());
            setLockPeriod(Number(lock));
        };

        fetchData();
    }, [stakingContract, tokenContract, walletAddress]);

    const setUserBoost = async () => {
        const boostInt = Math.floor(nftBoost); // e.g. 7 or 15 or 12 (average)
        const tx = await stakingContract.setUserBoostApy(walletAddress, boostInt);
        await tx.wait();
    };
    const sendBoostToBackend = async () => {
        try {
            await fetch("https://mogu-backend.vercel.app/api/setBoost", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user: walletAddress,
                    boost: Math.floor(nftBoost), // convert to integer
                }),
            });
            console.log("✅ Boost sent to backend");
        } catch (error) {
            console.error("❌ Failed to send boost:", error);
        }
    };


    const applyBoost = async () => {
        try {
            const boostValue = Math.round(nftBoost); // From useNFTBoost
            const res = await setBoostAPI(walletAddress, boostValue);
            alert("Boost Applied: " + res.txHash);
        } catch (err) {
            alert("Failed to apply boost.");
        }
    };

    const stakeTokens = async () => {
        try {
            await sendBoostToBackend(); // 🚀 1. Send boost

            const parsed = ethers.parseUnits(inputAmount, 18);
            await tokenContract.approve(STAKING_CONTRACT, parsed); // 2. Approve
            const tx = await stakingContract.deposit(parsed);       // 3. Stake
            await tx.wait();

            setInputAmount(""); // 4. Clear input
        } catch (err) {
            console.error("❌ Error staking:", err);
        }
    };


    const withdrawTokens = async () => {
        const tx = await stakingContract.withdraw();
        await tx.wait();
    };
    const emergencyWithdraw = async () => {
        try {
            if (!stakingContract) {
                console.error("Contract not loaded");
                return;
            }

            const tx = await stakingContract.emergencyWithdraw(); // No args
            await tx.wait();
            console.log("Emergency withdrawal successful");
        } catch (err) {
            console.error("Emergency withdraw failed:", err);
        }
    };



    const secondsToDhms = (seconds) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };

    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = unlockTime > currentTime ? unlockTime - currentTime : 0;

    return (
        <div className="staking-container">
            <motion.h2
                className="staking-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                🏦 MOGU Token Staking
            </motion.h2>

            <p className="staking-description">
                Stake $MOGU to earn rewards. APY: <strong>{apy}%</strong>, Lock-in: <strong>{lockPeriod / 86400} days</strong>, Early Exit Penalty: <strong>{penalty}%</strong>
            </p>
            <div className="boost-highlight">
                🧬 Boost from NFT: <strong>{nftBoost.toFixed(2)}%</strong>
            </div>

            <button onClick={applyBoost} className="btn-boost">
                Apply Boost to Contract
            </button>


            <div className="card">
                <p className="label">Your $MOGU Balance:</p>
                <p className="value">{parseFloat(balance).toFixed(2)}</p>

                <input
                    type="number"
                    placeholder="Amount to stake"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    className="input"
                />
                <button onClick={stakeTokens} className="btn-stake">
                    ✅ Stake
                </button>
            </div>

            <div className="card">
                <h3 className="card-title">📊 Your Staking Dashboard</h3>
                <p>🔒 Staked: <strong>{parseFloat(stakedAmount).toFixed(2)}</strong> $MOGU</p>
                <p>🎁 Rewards Earned: <strong>{parseFloat(rewards).toFixed(2)}</strong> $MOGU</p>
                <p>⏳ Time Left to Unlock: <strong>{secondsToDhms(timeLeft)}</strong></p>
                <p className="info-note">
                    {timeLeft > 0
                        ? `Withdrawing now will apply ${penalty}% penalty`
                        : 'You can withdraw without penalty'}
                </p>

                <button onClick={withdrawTokens} className="btn-withdraw">
                    Withdraw
                </button>

                {timeLeft > 0 && (
                    <button onClick={emergencyWithdraw} className="btn-emergency">
                        ⚠️ Emergency Withdraw (with penalty)
                    </button>
                )}
            </div>
        </div>
    );
}