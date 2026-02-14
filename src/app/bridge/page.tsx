"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs"; 
import io from "socket.io-client";
import Heartbeat from "@/components/Heartbeat";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, User, Sparkles, ArrowLeft, Smile, 
  Heart, Camera, Tag, MapPin, X, Eye, Users, Plus, Clock 
} from "lucide-react";

const socket = io("http://localhost:3001");

const aiOptions = [
  { id: "LUNA", name: "Luna", role: "Gentle Listener", color: "bg-purple-100 border-purple-300", icon: "🌙" },
  { id: "LEO", name: "Leo", role: "Motivator", color: "bg-orange-100 border-orange-300", icon: "🔥" },
  { id: "SAGE", name: "Sage", role: "Wise Guide", color: "bg-emerald-100 border-emerald-300", icon: "🌿" },
];

const emojis = ["❤️", "✨", "😊", "🫂", "🌙", "🔥", "🌿", "🌸", "☁️", "🙏"];

export default function BridgePage() {
  const { user, isLoaded } = useUser(); 
  const [mode, setMode] = useState<"human" | "ai" | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "matched">("idle");
  const [partner, setPartner] = useState<{ id: string; name: string } | null>(null);
  const [isNameRevealed, setIsNameRevealed] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [selectedAI, setSelectedAI] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ text: string; self: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [memoryDetails, setMemoryDetails] = useState({ photo: "", tags: "", description: "" });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isLoaded && user) {
      // Sync with server using unique Clerk ID to prevent duplicate "Harshiths"
      socket.emit("user_joined", { 
        externalId: user.id, 
        name: user.firstName || "A Soul" 
      });
    }

    socket.on("match_found", (data) => {
      setPartner({ id: data.partnerId, name: data.partnerName });
      setStatus("matched");
    });

    socket.on("online_users_update", (users) => {
      setOnlineUsers(users);
    });

    socket.on("partner_name_revealed", (data) => {
      setPartner(prev => prev ? { ...prev, name: data.name } : null);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, { text: data.text, self: false }]);
    });

    socket.on("partner_disconnected", () => {
      alert("Your partner has disconnected. ❤️");
      resetBridge();
    });

    return () => { 
      socket.off("match_found"); 
      socket.off("receive_message"); 
      socket.off("partner_disconnected");
      socket.off("partner_name_revealed");
      socket.off("online_users_update");
    };
  }, [user, isLoaded]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "waiting") {
      interval = setInterval(() => setWaitTime((prev) => prev + 1), 1000);
    } else {
      setWaitTime(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const revealMyName = () => {
    if (partner && user) {
      socket.emit("reveal_name", { to: partner.id, myName: user.firstName });
      setIsNameRevealed(true);
    }
  };

  const scheduleMessage = () => {
    if (!input.trim() || !partner) return;
    // Sends message delay to server (10 seconds for demo purposes)
    socket.emit("schedule_message", { 
      to: partner.id, 
      text: input, 
      delayMs: 10000 
    });
    setInput("");
    alert("Message scheduled! It will arrive in your partner's chat in 10 seconds. ⏳");
  };

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        }, () => resolve({ lat: 0, lng: 0 }));
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

  const finalizeSave = async () => {
    setIsSaving(true);
    const coords = await getLocation();
    
    const memory = {
      id: Date.now(),
      title: status === "matched" ? (mode === "ai" ? `Chat with ${selectedAI}` : `Human connection`) : "Direct Memory",
      description: memoryDetails.description,
      tags: memoryDetails.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
      photo: memoryDetails.photo,
      coords,
      date: new Date().toLocaleDateString(),
      icon: status === "matched" ? (mode === "ai" ? "🤖" : "📸") : "📍",
      pos: { top: `${Math.random() * 60 + 20}%`, left: `${Math.random() * 60 + 20}%` }
    };

    const existing = JSON.parse(localStorage.getItem("hb_memories") || "[]");
    localStorage.setItem("hb_memories", JSON.stringify([...existing, memory]));
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveModal(false);
      setMemoryDetails({ photo: "", tags: "", description: "" });
      alert("Pinned to your MemoryMap! 🗺️");
    }, 800);
  };

  const startHumanMatch = () => {
    setMode("human");
    setStatus("waiting");
    socket.emit("find_connection", { 
      externalId: user?.id, 
      name: user?.firstName || "A Soul" 
    });
  };

  const startAIChat = (id: string) => {
    setMode("ai");
    setSelectedAI(id);
    setStatus("matched");
    setMessages([{ text: `Hello! I'm ${id.charAt(0) + id.slice(1).toLowerCase()}. How can I support you today?`, self: false }]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((prev) => [...prev, { text: userMsg, self: true }]);
    setInput("");
    setShowEmojis(false);

    if (mode === "human" && partner) {
      socket.emit("send_message", { to: partner.id, text: userMsg });
    } else if (mode === "ai" && selectedAI) {
      setLoadingAI(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg, personality: selectedAI }),
        });
        const data = await res.json();
        if (data.text) setMessages((prev) => [...prev, { text: data.text, self: false }]);
      } finally {
        setLoadingAI(false);
      }
    }
  };

  const resetBridge = () => {
    setStatus("idle");
    setMode(null);
    setMessages([]);
    setIsNameRevealed(false);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 text-center space-y-8">
              <h1 className="text-5xl font-black text-gray-900">The Bridge</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={startHumanMatch} className="p-10 bg-white rounded-[40px] shadow-xl border-2 border-pink-100 hover:border-pink-500 transition-all flex flex-col items-center">
                  <div className="bg-pink-50 p-6 rounded-full mb-4"><User size={48} className="text-pink-500" /></div>
                  <h3 className="text-2xl font-bold">Human Heart</h3>
                  <p className="text-gray-500 text-sm mt-2">Find someone to talk to</p>
                </button>
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-2 border-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-6">AI Companions</p>
                  <div className="grid grid-cols-3 gap-4">
                    {aiOptions.map(ai => (
                      <button key={ai.id} onClick={() => startAIChat(ai.id)} className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${ai.color}`}>
                        <span className="text-3xl">{ai.icon}</span>
                        <p className="text-[10px] font-black uppercase mt-1">{ai.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[24px] font-bold shadow-lg hover:bg-indigo-700 mx-auto"
              >
                <Plus size={20} /> Quick Pin to Map
              </button>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-xl border border-pink-100 flex flex-col h-[500px]">
              <div className="flex items-center gap-2 mb-6 text-pink-600 font-bold">
                <Users size={20} />
                <span>Online Hearts</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {onlineUsers
                  .filter(u => u.externalId !== user?.id) // Hide yourself
                  .map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-sm">❤️</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{u.name}</p>
                      <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {status === "waiting" && (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8">
            <Heartbeat isSyncing={false} />
            <h2 className="text-3xl font-bold text-pink-600">Finding a connection... ({waitTime}s)</h2>
            <button onClick={resetBridge} className="px-6 py-2 border-2 border-gray-200 text-gray-400 rounded-full font-bold hover:bg-gray-100">Cancel</button>
          </motion.div>
        )}

        {status === "matched" && (
          <motion.div key="matched" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md h-[650px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-pink-100">
            <div className="p-5 bg-gray-900 text-white flex justify-between items-center">
              <button onClick={resetBridge} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={20}/></button>
              <div className="flex flex-col items-center gap-1">
                <span className="font-bold text-lg leading-tight">{mode === "ai" ? selectedAI : partner?.name}</span>
                {mode === "human" && !isNameRevealed && (
                  <button onClick={revealMyName} className="text-[10px] flex items-center gap-1 text-pink-400 hover:text-pink-300">
                    <Eye size={10}/> Reveal my name
                  </button>
                )}
              </div>
              <button onClick={() => setShowSaveModal(true)} className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition-all shadow-md">
                <Heart size={16} fill="white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.self ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 rounded-[24px] max-w-[85%] text-sm ${msg.self ? "bg-pink-500 text-white rounded-br-none shadow-lg" : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loadingAI && <div className="text-xs text-gray-400 italic flex items-center gap-2"><Sparkles size={12} className="animate-spin" /> Thinking...</div>}
              <div ref={chatEndRef} />
            </div>

            <AnimatePresence>
              {showEmojis && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="px-6 py-4 bg-white border-t flex flex-wrap gap-3 justify-center overflow-hidden">
                  {emojis.map(e => (
                    <button key={e} onClick={() => setInput(prev => prev + e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2 items-center">
              <button type="button" onClick={() => setShowEmojis(!showEmojis)} className={`p-2 ${showEmojis ? "text-pink-500" : "text-gray-300"}`}><Smile size={24} /></button>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Share your heart..." className="flex-1 p-3 bg-gray-100 rounded-2xl outline-none text-sm text-black" />
              {mode === "human" && (
                <button type="button" onClick={scheduleMessage} className="p-3 text-gray-400 hover:text-pink-500 transition-colors">
                  <Clock size={20} />
                </button>
              )}
              <button type="submit" disabled={!input.trim()} className="bg-pink-500 text-white p-3 rounded-2xl shadow-md disabled:opacity-50"><Send size={20}/></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSaveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setShowSaveModal(false)} className="absolute top-6 right-6 text-gray-400"><X size={20}/></button>
              <h3 className="text-xl font-bold mb-6">Capture the Moment</h3>
              <div className="space-y-4">
                <label className="block w-full h-32 border-2 border-dashed border-pink-100 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-pink-50/30">
                  {memoryDetails.photo ? (
                    <img src={memoryDetails.photo} className="w-full h-full object-cover" alt="Memory" />
                  ) : (
                    <><Camera className="text-pink-400 mb-2" /> <span className="text-xs text-pink-400 font-bold">Add Photo</span></>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImage} />
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3.5 text-gray-400" size={16} />
                  <input placeholder="Tags (comma separated)..." className="w-full p-3 pl-10 bg-gray-50 rounded-xl text-sm outline-none border border-gray-100" onChange={(e) => setMemoryDetails({...memoryDetails, tags: e.target.value})} />
                </div>
                <textarea placeholder="Tell your story..." className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none h-24 border border-gray-100 resize-none" onChange={(e) => setMemoryDetails({...memoryDetails, description: e.target.value})} />
                <button onClick={finalizeSave} disabled={isSaving} className="w-full py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-lg hover:bg-pink-600 transition-all disabled:opacity-50">
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