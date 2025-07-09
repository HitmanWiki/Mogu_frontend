// src/pages/Temple.jsx
import React from 'react';
import { motion } from 'framer-motion';
import pepeMeditate from '../assets/temple.gif'; // Add a temple GIF or image

export default function Temple() {
    return (
        <div className="flex flex-col items-center justify-center text-center mt-16 px-4">
            <motion.h1
                className="text-5xl font-bangers text-purple-800 drop-shadow mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                🛕 THE TEMPLE OF MOGU
            </motion.h1>

            <p className="text-gray-700 font-comic text-lg max-w-2xl">
                Here, the legends meditate. Pay respect to the <span className="text-purple-600 font-bold">$MOGU</span> gods,
                pray for juicy drops, and share WAGMI energy. It’s not a cult… it’s a lifestyle.
            </p>

            <img
                src={pepeMeditate}
                alt="Pepe Meditating"
                className="mt-10 w-64 rounded shadow-xl border-4 border-yellow-300"
            />

            <p className="mt-6 italic text-sm text-gray-500">
                ✨ “Those who stake in silence, print in noise.” – Mogu Proverb
            </p>
        </div>
    );
}
