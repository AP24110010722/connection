"use client";
import { motion } from "framer-motion";
import { MapPin, Image as ImageIcon, Calendar } from "lucide-react";

// Mock data for the demo
const mockMemories = [
  { id: 1, title: "Where we first talked", date: "Feb 14, 2026", pos: { top: "40%", left: "30%" }, icon: "💬" },
  { id: 2, title: "Our favorite café", date: "Feb 20, 2026", pos: { top: "60%", left: "55%" }, icon: "☕" },
];

export default function MapView() {
  return (
    <div className="relative w-full h-[500px] bg-slate-200 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
      {/* Visual placeholder for the Map - In production, replace with Google Maps */}
      <div className="absolute inset-0 bg-[url('https://www.google.com/maps/d/u/0/thumbnail?mid=1_f7_V8J...')] bg-cover opacity-40 grayscale-[50%]" />
      
      {/* Interactive Pins */}
      {mockMemories.map((memory) => (
        <motion.div
          key={memory.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.2 }}
          style={{ top: memory.pos.top, left: memory.pos.left }}
          className="absolute cursor-pointer group"
        >
          <div className="bg-white p-2 rounded-full shadow-lg border-2 border-pink-400 relative">
            <span className="text-xl">{memory.icon}</span>
            
            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-pink-100">
              <p className="font-bold text-gray-800 text-sm">{memory.title}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                <Calendar size={10} /> {memory.date}
              </div>
            </div>
          </div>
          <div className="w-1 h-4 bg-pink-400 mx-auto rounded-full" />
        </motion.div>
      ))}

      {/* Map Overlay Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button className="bg-white p-3 rounded-full shadow-lg text-pink-500 hover:bg-pink-50">
          <MapPin size={24} />
        </button>
      </div>
    </div>
  );
}