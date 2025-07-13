// src/components/Loader.jsx
import React from 'react';
import './loader.css';
import loaderImage from '../assets/logo.png'; // Use your static image here

const Loader = () => {
    return (
        <div className="loader-overlay">
            <img src={loaderImage} alt="Loading..." className="loader-img" />
        </div>
    );
};

export default Loader;
