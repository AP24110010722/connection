"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs"; //
import MapView from "@/components/MapView";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Camera, Tag, X, Sparkles, Heart, Trash2 } from "lucide-react";
import io from "socket.io-client";

// Connect to the production-ready socket server
const socket = io("http://localhost:3001");

export default function MemoryMapPage() {
  const { user: currentUser, isLoaded } = useUser(); //
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [memoryDetails, setMemoryDetails] = useState({ photo: "", tags: "", description: "" });

  useEffect(() => {
    if (isLoaded && currentUser) {
      // Sync with server using unique Clerk ID to prevent duplicates
      socket.emit("user_joined", { 
        externalId: currentUser.id, 
        name: currentUser.firstName || "Soul" 
      });
    }

    // Listen for updates to the global online user list
    socket.on("online_users_update", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online_users_update");
    };
  }, [currentUser, isLoaded]);

  // Unique Online Filtering: Remove self and ensure no duplicate names
  const uniqueFriends = onlineUsers
    .filter(u => u.externalId !== currentUser?.id)
    .filter((v, i, a) => a.findIndex(t => t.externalId === v.externalId) === i);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMemoryDetails({ ...memoryDetails, photo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const startFresh = () => {
    if (confirm("Are you sure you want to clear all your pinned memories? This cannot be undone. ❤️")) {
      localStorage.removeItem("hb_memories"); //
      window.location.reload();
    }
  };

  const saveDirectly = async () => {
    setIsSaving(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const memory = {
        id: Date.now(),
        title: "Direct Memory",
        description: memoryDetails.description,
        tags: memoryDetails.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
        photo: memoryDetails.photo,
        coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        date: new Date().toLocaleDateString(),
        icon: "📍",
      };

      const existing = JSON.parse(localStorage.getItem("hb_memories") || "[]");
      localStorage.setItem("hb_memories", JSON.stringify([...existing, memory]));
      
      setTimeout(() => {
        setIsSaving(false);
        setShowAddModal(false);
        window.location.reload(); 
      }, 800);
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Memory Map <span className="text-indigo-600 italic">Production</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Exploring the geography of your heart.</p>
          </motion.div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[24px] font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={20} /> Add Memory Directly
          </button>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Map Container */}
          <div className="lg:col-span-3 h-[650px]">
            <MapView />
          </div>

          {/* Sidebar: Online Hearts */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50 h-[650px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-xl">
                  <Users size={20} className="text-pink-600" />
                </div>
                <span className="font-bold text-slate-900">Online Hearts</span>
              </div>
              <button onClick={startFresh} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {uniqueFriends.map((friend) => (
                <div 
                  key={friend.id} 
                  className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 hover:border-pink-200 transition-all group"
                >
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                    ❤️
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{friend.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online</span>
                    </div>
                  </div>
                </div>
              ))}
              {uniqueFriends.length === 0 && (
                <div className="text-center py-10 opacity-50">
                  <Heart size={32} className="mx-auto text-slate-200 mb-2 animate-pulse" />
                  <p className="text-slate-400 text-xs font-medium italic">It's just you for now... ❤️</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-5 bg-indigo-600 rounded-[32px] text-white">
              <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                <Sparkles size={14} /> Global Reach
              </h4>
              <p className="text-[10px] text-indigo-100 leading-relaxed font-medium">
                Every pin is unique to your journey. Clear your data with the trash icon to start fresh.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-slate-400"><X size={20}/></button>
              <h3 className="text-xl font-bold mb-6">Quick Pin to Map</h3>
              <div className="space-y-4">
                <label className="block w-full h-32 border-2 border-dashed border-indigo-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-indigo-50/30">
                  {memoryDetails.photo ? (
                    <img src={memoryDetails.photo} className="w-full h-full object-cover" alt="Memory" />
                  ) : (
                    <><Camera className="text-indigo-400 mb-2" /> <span className="text-xs text-indigo-400 font-bold">Add Photo</span></>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3.5 text-slate-400" size={16} />
                  <input placeholder="Tags (comma separated)..." className="w-full p-3 pl-10 bg-slate-50 rounded-xl text-sm outline-none border border-slate-100" onChange={(e) => setMemoryDetails({...memoryDetails, tags: e.target.value})} />
                </div>
                <textarea placeholder="Tell your story..." className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none h-24 border border-slate-100 resize-none" onChange={(e) => setMemoryDetails({...memoryDetails, description: e.target.value})} />
                <button onClick={saveDirectly} disabled={isSaving} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                  {isSaving ? "Pinning..." : "Pin to MemoryMap"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}