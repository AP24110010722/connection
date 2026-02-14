"use client";
import { motion } from "framer-motion";

export default function Heartbeat({ isSyncing = false }) {
  return (
    <div className="flex items-center justify-center space-x-4">
      <motion.div
        animate={{
          scale: isSyncing ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isSyncing ? [0.8, 1, 0.8] : 0.6,
        }}
        transition={{
          duration: isSyncing ? 0.8 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-24 h-24 bg-red-400 rounded-full blur-xl absolute"
      />
      <div className="relative z-10 text-4xl text-white">❤️</div>
    </div>
  );
}