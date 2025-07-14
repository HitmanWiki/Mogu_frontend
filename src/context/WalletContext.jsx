// src/context/WalletContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const { address: walletAddress } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const [showDropdown, setShowDropdown] = useState(false);

    const toggleDropdown = () => setShowDropdown(!showDropdown);

    const connectWith = (name) => {
        const connector = connectors.find((c) => c.name === name);
        if (connector) {
            connect({ connector });
            setShowDropdown(false);
        } else {
            alert(`${name} connector not available`);
        }
    };

    return (
        <WalletContext.Provider
            value={{
                walletAddress,
                connectWith,
                disconnectWallet: disconnect,
                showDropdown,
                toggleDropdown,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export function useWallet() {
    return useContext(WalletContext);
}
