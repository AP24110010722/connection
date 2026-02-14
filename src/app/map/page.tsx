"use client";

import { useState, useEffect } from "react";
import MapView from "@/components/MapView";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Camera, Tag, MapPin, X, Sparkles } from "lucide-react";
import io from "socket.io-client";

// Connect to the socket server for real-time online status
const socket = io("http://localhost:3001");

export default function MemoryMapPage() {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [memoryDetails, setMemoryDetails] = useState({ photo: "", tags: "", description: "" });

  useEffect(() => {
    // Report our presence when entering the map
    socket.emit("user_joined", { name: "Harshith" }); // Replace with actual user name

    // Listen for updates to the global online user list
    socket.on("online_users_update", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online_users_update");
    };
  }, []);

  // Capture device GPS location for the direct pin
  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 0, lng: 0 })
        );
      } else {
        resolve({ lat: 0, lng: 0 });
      }
    });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMemoryDetails({ ...memoryDetails, photo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const saveDirectly = async () => {
    setIsSaving(true);
    const coords = await getLocation();
    
    const memory = {
      id: Date.now(),
      title: "Direct Memory",
      description: memoryDetails.description,
      tags: memoryDetails.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
      photo: memoryDetails.photo,
      coords,
      date: new Date().toLocaleDateString(),
      icon: "📍",
      // Random visual placement for the demo UI
      pos: { top: `${Math.random() * 60 + 20}%`, left: `${Math.random() * 60 + 20}%` }
    };

    const existing = JSON.parse(localStorage.getItem("hb_memories") || "[]");
    localStorage.setItem("hb_memories", JSON.stringify([...existing, memory]));
    
    setTimeout(() => {
      setIsSaving(false);
      setShowAddModal(false);
      setMemoryDetails({ photo: "", tags: "", description: "" });
      // Refresh the page or update state to show the new pin
      window.location.reload(); 
    }, 800);
  };

  return (
    <div className="min-h-screen bg-indigo-50/50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Content: Map Area */}
        <div className="lg:col-span-3">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-indigo-600" />
                <span className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">Your Emotional Geography</span>
              </div>
              <h1 className="text-4xl font-black text-indigo-950">MemoryMap</h1>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-bold shadow-lg hover:bg-indigo-700 transition-all"
            >
              <Plus size={20} /> Add Memory Directly
            </button>
          </header>

          <MapView />
        </div>

        {/* Sidebar: Online Tab */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-xl border border-indigo-100 h-[650px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-indigo-950 font-bold">
                <Users size={20} className="text-indigo-600" />
                <span>Online Hearts</span>
              </div>
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold">
                {onlineUsers.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {onlineUsers.map((user) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={user.id} 
                  className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-50 hover:border-indigo-200 transition-all"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg shadow-sm">
                    {user.name === "Harshith" ? "👑" : "❤️"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Connected</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {onlineUsers.length === 0 && (
                <p className="text-center text-gray-400 text-xs mt-10">Waiting for hearts to join...</p>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 text-[10px] text-center text-gray-400 font-medium">
              Only friends you've matched with can see your precise pins.
            </div>
          </div>
        </div>
      </div>

      {/* Direct Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAddModal(false)} 
                className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X size={20}/>
              </button>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                  <Camera size={20} />
                </div>
                <h3 className="font-bold text-xl text-indigo-950">Quick Pin</h3>
              </div>

              <div className="space-y-4">
                <label className="block w-full h-40 border-2 border-dashed border-indigo-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-indigo-50/30 hover:bg-indigo-50 transition-colors">
                   {memoryDetails.photo ? (
                     <img src={memoryDetails.photo} className="w-full h-full object-cover" alt="Preview" />
                   ) : (
                     <div className="text-center">
                        <Camera className="text-indigo-400 mx-auto mb-2" size={32} />
                        <span className="text-xs text-indigo-400 font-bold">Upload a Photo</span>
                     </div>
                   )}
                   <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                </label>

                <div className="relative">
                  <Tag className="absolute left-3 top-3.5 text-indigo-300" size={16} />
                  <input 
                    placeholder="Tags (coffee, sunset...)" 
                    className="w-full p-3 pl-10 bg-gray-50 rounded-2xl text-sm outline-none border border-gray-100 focus:ring-2 ring-indigo-100 transition-all" 
                    onChange={e => setMemoryDetails({...memoryDetails, tags: e.target.value})} 
                  />
                </div>

                <textarea 
                  placeholder="What's the story behind this moment?" 
                  className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none h-32 border border-gray-100 focus:ring-2 ring-indigo-100 transition-all resize-none" 
                  onChange={e => setMemoryDetails({...memoryDetails, description: e.target.value})} 
                />

                <button 
                  onClick={saveDirectly} 
                  disabled={isSaving || !memoryDetails.photo}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? "Saving..." : <><Sparkles size={18}/> Pin to My Map</>}
                </button>
                <p className="text-[10px] text-center text-gray-400">Your current GPS location will be attached to this pin.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}