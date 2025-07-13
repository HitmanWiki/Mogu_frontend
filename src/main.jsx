import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { WalletProvider } from './context/WalletContext'; // 👈 make sure this is correct

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <WalletProvider> {/* ✅ Wrap here */}
                <App />
            </WalletProvider>
        </BrowserRouter>
    </React.StrictMode>
);
