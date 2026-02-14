"use client";

import { useEffect, useState } from "react";
import dynamicImport from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Tag, MapPin, X, Sparkles, Trash2, RefreshCcw } from "lucide-react";

// Completely isolate Leaflet components from SSR
const MapContainer = dynamicImport(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamicImport(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamicImport(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamicImport(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export default function MapView() {
  const [memories, setMemories] = useState<any[]>([]); 
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [leafletLib, setLeafletLib] = useState<any>(null);

  useEffect(() => {
    const loadLeaflet = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      
      // Fix default icon issues for browser rendering
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
      
      setLeafletLib(L);
    };

    loadLeaflet();
    
    try {
      const saved = localStorage.getItem("hb_memories");
      if (saved) {
        setMemories(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load memories:", e);
    }
  }, []);

  // DELETE SINGLE PIN
  const deletePin = (id: number) => {
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    localStorage.setItem("hb_memories", JSON.stringify(updated));
    setSelectedMemory(null);
  };

  // CLEAR ENTIRE MAP
  const clearAll = () => {
    if (confirm("Are you sure? This will delete ALL memories forever. ❤️")) {
      localStorage.removeItem("hb_memories");
      setMemories([]);
      setSelectedMemory(null);
    }
  };

  if (!leafletLib) {
    return (
      <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-[40px] flex flex-col items-center justify-center border-4 border-white shadow-inner">
        <MapPin size={40} className="text-slate-300 mb-4 animate-bounce" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Initializing HeartMap...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl z-0">
      {/* FACTORY RESET BUTTON */}
      <div className="absolute top-4 left-4 z-[1000]">
        <button 
          onClick={clearAll}
          className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-red-500 shadow-lg border border-red-50 hover:bg-red-50 flex items-center gap-2 uppercase tracking-widest"
        >
          <Trash2 size={12} /> Factory Reset Map
        </button>
      </div>

      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {memories.length > 0 && memories.map((m) => {
          if (!m?.coords?.lat || !m?.coords?.lng) return null;

          return (
            <Marker 
              key={m.id} 
              position={[m.coords.lat, m.coords.lng]}
              eventHandlers={{ click: () => setSelectedMemory(m) }}
            >
              <Popup>
                <div className="font-bold text-indigo-900 text-center px-2">
                  <span className="text-lg block mb-1">{m.icon || "❤️"}</span>
                  {m.title}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <AnimatePresence>
        {selectedMemory && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
            className="absolute top-4 right-4 bottom-4 w-80 bg-white/95 backdrop-blur-md rounded-[32px] shadow-2xl z-[1000] p-6 flex flex-col border border-indigo-50"
          >
            <button 
                onClick={() => setSelectedMemory(null)} 
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={16} className="text-slate-500" />
            </button>

            {selectedMemory.photo && (
              <img 
                src={selectedMemory.photo} 
                className="w-full h-40 object-cover rounded-2xl mb-4 shadow-sm" 
                alt="Memory" 
              />
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedMemory.icon}</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedMemory.title}</h3>
              </div>
              <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase tracking-tighter">
                <Calendar size={10} className="inline mr-1" /> {selectedMemory.date}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {selectedMemory.tags?.map((tag: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-pink-50 text-pink-500 text-[10px] font-bold rounded-md border border-pink-100">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-2xl italic text-gray-700 text-sm border border-indigo-100 leading-relaxed mb-4">
                "{selectedMemory.description || "A beautiful moment captured on HeartBridge."}"
              </div>

              {/* DELETE INDIVIDUAL PIN BUTTON */}
              <button 
                onClick={() => deletePin(selectedMemory.id)}
                className="w-full py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Remove this Pin
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 font-bold">
               <span className="flex items-center gap-1">
                 <MapPin size={10} className="text-indigo-400" /> 
                 {selectedMemory.coords.lat.toFixed(3)}, {selectedMemory.coords.lng.toFixed(3)}
               </span>
               <div className="flex items-center gap-1 text-indigo-600">
                 <Sparkles size={10} />
                 <span>HEARTBRIDGE</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}