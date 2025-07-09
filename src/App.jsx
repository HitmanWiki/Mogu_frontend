import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import Home from './pages/Home';
import Staking from './pages/Staking';
import Temple from './pages/Temple';
import Inventory from './pages/Inventory';
import MoguBox from './pages/MoguBox';

import LogoBear from './assets/logo.png';
import './App.css';

import { useWallet } from './context/WalletContext';

export default function App() {
    const { walletAddress, setWalletAddress } = useWallet();

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                toast.error("🦊 Please install MetaMask!");
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                toast.success("✅ Wallet connected!");
            }
        } catch (error) {
            console.error(error);
            toast.error("❌ Wallet connection failed.");
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        toast.info("👋 Wallet disconnected.");
    };

    const shortenAddress = (addr) =>
        addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

    return (
        <Router>
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-yellow-50 to-orange-100 font-sans">
                <header className="bg-white shadow-md sticky top-0 z-50">
                    <div className="header-container">
                        <div className="nav-left">
                            <Link to="/" className="flex items-center">
                                <img src={LogoBear} alt="Mogu Logo" className="logo-img" />
                                <span className="font-extrabold text-xl text-gray-800 ml-2">MOGUBOX</span>
                            </Link>
                            <nav className="nav-links text-gray-700 text-sm">
                                <Link to="/staking">Staking</Link>
                                <Link to="/temple">Temple</Link>
                                <Link to="/inventory">Inventory</Link>
                            </nav>
                        </div>

                        <div className="nav-right">
                            {walletAddress ? (
                                <>
                                    <span className="text-purple-700 font-semibold">{shortenAddress(walletAddress)}</span>
                                    <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
                                </>
                            ) : (
                                <button onClick={connectWallet} className="connect-btn">Connect Wallet</button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-grow flex justify-center items-start px-4 pt-10">
                    <Routes>
                        <Route path="/" element={<MoguBox />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/staking" element={<Staking />} />
                        <Route path="/temple" element={<Temple />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/mogubox" element={<MoguBox />} />
                    </Routes>
                </main>

                <footer className="bg-yellow-200 text-center py-4 text-sm text-gray-700">
                    ✨ Built with memes & bears | © {new Date().getFullYear()} MOGUBOX | Long nose, longer rewards 🐻
                </footer>

                <ToastContainer position="top-right" autoClose={3000} pauseOnHover draggable theme="colored" />
            </div>
        </Router>
    );
}
