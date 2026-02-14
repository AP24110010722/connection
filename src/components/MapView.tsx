"use client";

import { useEffect, useState } from "react";
import dynamicImport from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, X, Trash2, Calendar, Smile } from "lucide-react";
import { useMapEvents } from "react-leaflet";

const MapContainer = dynamicImport(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamicImport(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamicImport(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamicImport(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click(e) { onMapClick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

const EMOJIS = ["❤️", "✨", "😊", "🫂", "🏠", "✈️", "🎓", "🔥", "🌿", "🌸"];

export default function MapView() {
  const [memories, setMemories] = useState<any[]>([]); 
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [newLocation, setNewLocation] = useState<{lat: number, lng: number} | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", icon: "❤️" });
  const [isMounted, setIsMounted] = useState(false);

  const refreshData = async () => {
    try {
      const memRes = await fetch("/api/memories");
      const data = await memRes.json();
      setMemories(Array.isArray(data) ? data : []);
    } catch (error) { console.error("Error fetching memories:", error); }
  };

  useEffect(() => {
    setIsMounted(true);
    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    })();
    refreshData();
  }, []);

  const saveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation) return;
    await fetch("/api/memories", {
        method: "POST",
        body: JSON.stringify({ ...formData, date: new Date().toLocaleDateString(), coords: newLocation }),
        headers: { "Content-Type": "application/json" }
    });
    await refreshData();
    setNewLocation(null);
    setFormData({ title: "", description: "", icon: "❤️" });
  };

  const deletePin = async (id: string) => {
      if(!confirm("Delete this memory forever?")) return;
      await fetch("/api/memories", {
          method: "DELETE",
          body: JSON.stringify({ id }),
          headers: { "Content-Type": "application/json" }
      });
      await refreshData();
      setSelectedMemory(null);
  };

  if (!isMounted) return <div className="h-[600px] w-full bg-slate-100 flex items-center justify-center rounded-[40px]"><p className="text-slate-400 font-bold animate-pulse">Loading Map...</p></div>;

  return (
    <div className="relative w-full h-[600px] rounded-[40px] overflow-hidden border-8 border-white shadow-2xl z-0">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onMapClick={(lat, lng) => { setNewLocation({ lat, lng }); setSelectedMemory(null); }} />
        
        {memories.map((m) => (
          <Marker key={m._id} position={[m.coords.lat, m.coords.lng]} eventHandlers={{ click: () => { setSelectedMemory(m); setNewLocation(null); } }}>
            <Popup>{m.title}</Popup>
          </Marker>
        ))}
        {newLocation && <Marker position={[newLocation.lat, newLocation.lng]} opacity={0.5} />}
      </MapContainer>

      {/* NEW MEMORY FORM */}
      <AnimatePresence>
        {newLocation && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/30 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
             <form onSubmit={saveMemory} className="bg-white p-6 rounded-[32px] shadow-2xl w-full max-w-sm space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Plus size={20} className="text-pink-500"/> New Memory</h3>
                 <button type="button" onClick={() => setNewLocation(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={16}/></button>
               </div>
               <input autoFocus placeholder="Title" className="w-full bg-slate-50 p-3 rounded-xl font-bold text-slate-700 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
               <textarea placeholder="Description..." className="w-full bg-slate-50 p-3 rounded-xl text-sm text-slate-600 outline-none h-20 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               <div className="flex flex-wrap gap-2 justify-center">
                    {EMOJIS.map(emoji => (
                    <button type="button" key={emoji} onClick={() => setFormData({...formData, icon: emoji})} className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl transition-all ${formData.icon === emoji ? "bg-pink-100 border-pink-300 scale-110" : "bg-white border-slate-100"}`}>{emoji}</button>
                    ))}
               </div>
               <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors">Plant Memory</button>
             </form>
           </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW MEMORY */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="absolute top-4 right-4 bottom-4 w-80 bg-white/95 backdrop-blur-md rounded-[32px] shadow-2xl z-[1000] p-6 flex flex-col border border-indigo-50">
            <button onClick={() => setSelectedMemory(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={16} /></button>
            <div className="mt-8 text-center flex-1">
                <div className="text-6xl mb-4">{selectedMemory.icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{selectedMemory.title}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-6"><Calendar size={10} className="inline mr-1" /> {selectedMemory.date}</p>
                <div className="bg-indigo-50/50 p-4 rounded-2xl italic text-gray-700 text-sm border leading-relaxed text-left">"{selectedMemory.description}"</div>
            </div>
            <button onClick={() => deletePin(selectedMemory._id)} className="w-full py-3 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"><Trash2 size={14} /> Remove Pin</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}