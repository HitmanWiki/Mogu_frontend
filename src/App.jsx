import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Loader from './components/loader';

import 'react-toastify/dist/ReactToastify.css';


import Home from './pages/Home';
import Staking from './pages/Staking';
import Temple from './pages/Temple';
import Inventory from './pages/Inventory';
import MoguBox from './pages/MoguBox';
import { useRef } from 'react';

import LogoBear from './assets/logo.png';
import './App.css';

import { useWallet } from './context/WalletContext';

export default function App() {
    const { walletAddress, connectWith, disconnectWallet, showDropdown, toggleDropdown } = useWallet();


    // const connectWallet = async () => {
    //     try {
    //         if (!window.ethereum) {
    //             toast.error("🦊 Please install MetaMask!");
    //             return;
    //         }

    //         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    //         if (accounts.length > 0) {
    //             setWalletAddress(accounts[0]);
    //             toast.success("✅ Wallet connected!");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         toast.error("❌ Wallet connection failed.");
    //     }
    // };


    // const disconnectWallet = () => {
    //     setWalletAddress(null);
    //     toast.info("👋 Wallet disconnected.");
    // };

    const shortenAddress = (addr) =>
        addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

    const location = useLocation();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800); // Simulate route loading delay (or fetch real data timing)

        return () => clearTimeout(timer);
    }, [location.pathname]);


    return (

        <div className="app-container">
            <header className="app-header">
                <div className="header-container">
                    <div className="nav-left">
                        <Link to="/" className="logo-wrapper">
                            <img src={LogoBear} alt="Mogu Logo" className="logo-img" />
                            <span className="logo-text">MOGUBOX</span>
                        </Link>
                        <nav className="nav-links">
                            <Link to="/staking">Staking</Link>
                            <Link to="/temple">Temple</Link>
                            <Link to="/inventory">Inventory</Link>
                        </nav>
                    </div>
                    <div className="nav-right">
                        {walletAddress ? (
                            <>
                                <span className="wallet-address">{shortenAddress(walletAddress)}</span>
                                <button onClick={disconnectWallet} className="disconnect-btn">Disconnect</button>
                            </>
                        ) : (
                            <div className="wallet-dropdown">
                                <button onClick={toggleDropdown} className="connect-btn">Connect Wallet</button>
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <button onClick={() => connectWith('MetaMask')}>MetaMask</button>
                                        <button onClick={() => connectWith('WalletConnect')}>WalletConnect</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                </div>
            </header>

            <main className="main-content">
                {loading ? (
                    <Loader />
                ) : (
                    <Routes>
                        <Route path="/" element={<MoguBox />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/staking" element={<Staking />} />
                        <Route path="/temple" element={<Temple />} />
                        <Route path="/inventory" element={<Inventory />} />
                        <Route path="/mogubox" element={<MoguBox />} />
                    </Routes>
                )}
            </main>

            <footer className="app-footer">
                ✨ Built with memes & bears | © {new Date().getFullYear()} MOGUBOX | Long nose, longer rewards 🐻
            </footer>

            <ToastContainer position="top-right" autoClose={3000} pauseOnHover draggable theme="colored" />
        </div>
    );
}