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
  const [partner, setPartner] = useState<{ id: string; name: string; partnerExternalId: string } | null>(null);
  const [userGender, setUserGender] = useState<"Male" | "Female" | "">("");
  const [delayTime, setDelayTime] = useState("1"); // Default: 1 minute
  const [hasLiked, setHasLiked] = useState(false);
  const [messages, setMessages] = useState<{ text: string; self: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [isNameRevealed, setIsNameRevealed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && user) {
      socket.emit("user_joined", { externalId: user.id, name: user.firstName, gender: userGender });
    }

    socket.on("match_found", (data) => {
      setPartner({ id: data.partnerId, name: data.partnerName, partnerExternalId: data.partnerExternalId });
      setStatus("matched");
    });

    socket.on("receive_message", (data) => setMessages((prev) => [...prev, { text: data.text, self: false }]));
    socket.on("partner_name_revealed", (data) => setPartner(prev => prev ? { ...prev, name: data.name } : null));

    return () => { socket.off(); };
  }, [user, isLoaded, userGender]);

  const handleLike = () => {
    if (!partner) return;
    const friend = { id: partner.partnerExternalId, name: partner.name, addedAt: new Date().toLocaleDateString() };
    const existing = JSON.parse(localStorage.getItem("hb_friends") || "[]");
    if (!existing.find((f: any) => f.id === friend.id)) {
      localStorage.setItem("hb_friends", JSON.stringify([...existing, friend]));
    }
    setHasLiked(true);
    alert(`Added to friends! ❤️`);
  };

  const scheduleMessage = () => {
    if (!input.trim() || !partner) return;
    socket.emit("schedule_message", { to: partner.id, text: input, delayMs: parseInt(delayTime) * 60000 });
    setInput("");
    alert(`Scheduled for ${delayTime}m! ⏳`);
  };

  const startHumanMatch = () => {
    if (!userGender) return alert("Please select your gender first!");
    setMode("human"); setStatus("waiting");
    socket.emit("find_connection", { externalId: user?.id, name: user?.firstName, gender: userGender });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && partner) {
      socket.emit("send_message", { to: partner.id, text: input });
      setMessages(prev => [...prev, { text: input, self: true }]);
      setInput("");
    }
  };

  const resetBridge = () => { setStatus("idle"); setMode(null); setMessages([]); setIsNameRevealed(false); setHasLiked(false); };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl space-y-8 text-center">
            <h1 className="text-5xl font-black text-gray-900">The Bridge</h1>
            <div className="bg-white p-6 rounded-3xl inline-flex gap-4 shadow-sm border border-pink-100">
               <button onClick={() => setUserGender("Male")} className={`px-6 py-2 rounded-xl font-bold transition-all ${userGender === "Male" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>Male</button>
               <button onClick={() => setUserGender("Female")} className={`px-6 py-2 rounded-xl font-bold transition-all ${userGender === "Female" ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-400"}`}>Female</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={startHumanMatch} className="p-10 bg-white rounded-[40px] shadow-xl border-2 border-pink-100 hover:border-indigo-500 flex flex-col items-center">
                <User size={48} className="text-indigo-500 mb-4" />
                <h3 className="text-2xl font-bold">Find Opposite Gender</h3>
              </button>
              <div className="bg-white p-8 rounded-[40px] shadow-xl flex flex-col justify-center gap-4">
                <p className="text-xs font-bold text-gray-400 uppercase">AI Companions</p>
                <div className="flex justify-center gap-4">
                  {aiOptions.map(ai => (
                    <button key={ai.id} onClick={() => setStatus("matched")} className={`p-4 rounded-3xl ${ai.color}`}>
                      <span className="text-2xl">{ai.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {status === "matched" && (
          <motion.div className="w-full max-w-md h-[650px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <button onClick={resetBridge}><ArrowLeft size={20}/></button>
              <span className="font-bold">{partner?.name}</span>
              <button onClick={handleLike} className={`p-2 rounded-full ${hasLiked ? "text-pink-500" : "text-white"}`}><Heart size={20} fill={hasLiked ? "currentColor" : "none"} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.self ? "justify-end" : "justify-start"}`}>
                  <div className={`p-4 rounded-3xl max-w-[80%] text-sm ${m.self ? "bg-indigo-600 text-white" : "bg-white border"}`}>{m.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2 items-center">
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 bg-slate-100 rounded-2xl text-sm" />
              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border">
                <input type="number" value={delayTime} onChange={e => setDelayTime(e.target.value)} className="w-10 bg-transparent text-center font-bold text-xs text-indigo-600 outline-none" min="1" />
                <button type="button" onClick={scheduleMessage} className="text-slate-400 hover:text-indigo-600"><Clock size={20}/></button>
              </div>
              <button type="submit" className="bg-indigo-600 text-white p-3 rounded-2xl"><Send size={20}/></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}