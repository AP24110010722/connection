"use client";
import { useState } from "react";
import Heartbeat from "@/components/Heartbeat";
import { motion } from "framer-motion";

const aiOptions = [
  { id: "LUNA", name: "Luna", role: "Gentle Listener", color: "bg-purple-100 border-purple-300", icon: "🌙" },
  { id: "LEO", name: "Leo", role: "Motivator", color: "bg-orange-100 border-orange-300", icon: "🔥" },
  { id: "SAGE", name: "Sage", role: "Wise Guide", color: "bg-emerald-100 border-emerald-300", icon: "🌿" },
];

export default function BridgePage() {
  const [selectedAI, setSelectedAI] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Find a Connection</h1>
      <p className="text-gray-500 mb-8 text-center">No one is online? Our AI companions are here to listen.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {aiOptions.map((ai) => (
          <motion.div
            key={ai.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedAI(ai.id)}
            className={`cursor-pointer p-6 rounded-3xl border-2 shadow-sm transition-all ${ai.color} ${
              selectedAI === ai.id ? "ring-4 ring-pink-400 border-transparent" : ""
            }`}
          >
            <div className="text-4xl mb-4">{ai.icon}</div>
            <h3 className="text-xl font-bold text-gray-800">{ai.name}</h3>
            <p className="text-gray-600">{ai.role}</p>
          </motion.div>
        ))}
      </div>

      {selectedAI && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-12 text-center"
        >
          <Heartbeat isSyncing={true} />
          <button className="mt-8 px-8 py-3 bg-pink-500 text-white rounded-full font-bold shadow-lg hover:bg-pink-600 transition-colors">
            Start Conversation with {selectedAI}
          </button>
        </motion.div>
      )}
    </div>
  );
}