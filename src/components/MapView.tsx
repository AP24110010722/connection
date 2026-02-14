"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, X, Tag } from "lucide-react";

export default function MapView() {
  const [memories, setMemories] = useState<any[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<any>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("hb_memories") || "[]");
    setMemories(saved);
  }, []);

  const clearMemories = () => {
    if(confirm("Are you sure you want to clear your heart's history?")) {
      localStorage.removeItem("hb_memories");
      setMemories([]);
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-indigo-50 rounded-[40px] overflow-hidden border-8 border-white shadow-2xl group">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stitched-wool.png')]" />
      
      {memories.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-300">
          <MapPin size={48} className="mb-4 opacity-20" />
          <p className="font-medium">No memories pinned yet.</p>
        </div>
      ) : (
        <>
          <div className="absolute top-6 right-6 z-10">
            <button onClick={clearMemories} className="px-4 py-2 bg-white/80 backdrop-blur-md text-red-400 text-xs font-bold rounded-full shadow-sm hover:bg-red-50 transition-all">Clear Map</button>
          </div>
          {memories.map((m) => (
            <motion.div
              key={m.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ top: m.pos.top, left: m.pos.left }}
              className="absolute cursor-pointer z-10"
              onClick={() => setSelectedMemory(m)}
            >
              <motion.div whileHover={{ y: -5 }} className="bg-white p-3 rounded-full shadow-lg border-2 border-pink-400 flex items-center justify-center">
                <span className="text-xl">{m.icon}</span>
              </motion.div>
              <div className="w-1.5 h-4 bg-pink-400/50 mx-auto rounded-full blur-[1px]" />
            </motion.div>
          ))}
        </>
      )}

      <AnimatePresence>
        {selectedMemory && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"><X size={16}/></button>
              
              {selectedMemory.photo && (
                <div className="h-48 w-full">
                  <img src={selectedMemory.photo} className="w-full h-full object-cover" alt="Memory" />
                </div>
              )}
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedMemory.title}</h3>
                    <p className="text-gray-400 text-xs flex items-center gap-1 mt-1"><Calendar size={12}/> {selectedMemory.date}</p>
                  </div>
                  <span className="text-2xl">{selectedMemory.icon}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedMemory.tags?.map((tag: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-pink-50 text-pink-500 text-[10px] font-bold rounded-md flex items-center gap-1 uppercase tracking-wider"><Tag size={8}/> {tag}</span>
                  ))}
                </div>

                <div className="bg-indigo-50 p-6 rounded-3xl italic text-gray-700 leading-relaxed border border-indigo-100 text-sm">
                  "{selectedMemory.description || "A beautiful moment preserved forever."}"
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-[10px] text-gray-400 font-bold bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <MapPin size={10} className="text-pink-400" />
                  Captured at: {selectedMemory.coords?.lat.toFixed(4)}, {selectedMemory.coords?.lng.toFixed(4)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}