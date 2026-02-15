"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useUser } from "@clerk/nextjs"; 
import { useSearchParams, useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, ArrowLeft, Heart, Clock, X, Plus, MapPin, Smile, Loader2 } from "lucide-react";
import { PERSONAS } from "@/lib/constants";

const EMOJIS = ["❤️", "😂", "😊", "😢", "🔥", "👍", "👋", "✨", "🫂", "🙏"];

export default function BridgePage() {
  return ( <Suspense fallback={<div>Loading...</div>}><BridgeContent /></Suspense> );
}

function BridgeContent() {
  const { user, isLoaded } = useUser(); 
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mode, setMode] = useState<"human" | "ai" | null>(null);
  const [status, setStatus] = useState<"idle" | "waiting" | "matched">("idle");
  const [partner, setPartner] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [userGender, setUserGender] = useState(""); 
  const [isMutual, setIsMutual] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  
  const [isFriend, setIsFriend] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const checkFriendStatus = async (partnerId: string) => {
    if (!partnerId) return;
    setFriendLoading(true);
    try {
        const res = await fetch("/api/friends");
        const friends = await res.json();
        const found = friends.find((f: any) => f.externalId === partnerId);
        setIsFriend(!!found);
    } catch(e) { console.error(e); }
    finally { setFriendLoading(false); }
  };

  useEffect(() => {
    // UPDATED: Use env variable for production, fallback to localhost for dev
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const newSocket = io(socketUrl, { autoConnect: false });
    
    setSocket(newSocket);
    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    return () => { newSocket.disconnect(); };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => {
        if (user && isLoaded) socket.emit("user_joined", { externalId: user.id, name: user.firstName, gender: userGender });
    };
    socket.on("connect", handleConnect);
    
    socket.on("match_found", (data) => {
        const partnerData = { id: data.partnerId, name: data.partnerName, externalId: data.partnerExternalId };
        startChat(partnerData);
        checkFriendStatus(data.partnerExternalId);
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, { text: data.text, self: false }]);
    });
    
    socket.on("friendship_status", (data) => {
        if (data.status === "mutual" && partner && data.with === partner.externalId) {
            setIsMutual(true);
            alert("Mutual Friends! Schedule Send Unlocked 🔓");
        }
    });

    socket.on("online_users_update", (onlineUsers: any[]) => {
      const dmTargetId = searchParams.get("dm");
      const dmName = searchParams.get("name");

      if (dmTargetId && status === "idle") {
        const target = onlineUsers.find(u => u.externalId === dmTargetId);
        if (target) {
            startChat(target);
            checkFriendStatus(target.externalId);
        } else if (dmName) {
             // Optional: Handle offline user logic here
        }
      }
    });
    
    if (user && isLoaded) { socket.connect(); handleConnect(); }
    return () => { socket.off(); };
  }, [socket, user, isLoaded, searchParams, status, userGender, partner]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startChat = (targetUser: any) => {
    setMode("human");
    setPartner(targetUser);
    setStatus("matched");
  };

  const handleFindConnection = () => {
      if (!userGender) return alert("Select gender first!");
      if (!isConnected) return alert("Connecting to server...");
      setMode("human"); setStatus("waiting");
      socket?.emit("find_connection", { externalId: user?.id, name: user?.firstName, gender: userGender });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !partner) return;
    const msg = input;
    setMessages(prev => [...prev, { text: msg, self: true }]);
    setInput("");
    setShowEmojis(false);

    if (mode === "human" && socket) {
      socket.emit("send_message", { to: partner.id, text: msg, senderId: user?.id, recipientId: partner.externalId });
    } else if (mode === "ai") {
       try {
        const res = await fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ message: msg, personality: partner.id }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        setMessages(prev => [...prev, { text: data.text, self: false }]);
      } catch (err) {}
    }
  };

  const pinToMap = async (text: string) => {
    if(!confirm("Pin to Map? 🌍")) return;
    try {
        await fetch("/api/memories", {
            method: "POST",
            body: JSON.stringify({ title: `Chat with ${partner?.name}`, description: text, icon: "💬", coords: { lat: (Math.random()*180)-90, lng: (Math.random()*360)-180 } }),
            headers: { "Content-Type": "application/json" }
        });
        alert("Pinned! Check the Map tab.");
    } catch(e) { alert("Error pinning memory."); }
  };

  const handleSchedule = () => {
    if (!input.trim() || !partner || !socket || !scheduleDate) return;
    if (!isMutual) return alert("Mutuals only! ❤️");
    socket.emit("schedule_message", { to: partner.id, text: input, sendAt: scheduleDate, senderId: user?.id, recipientId: partner.externalId });
    const displayDate = new Date(scheduleDate).toLocaleString();
    setMessages(prev => [...prev, { text: `(Scheduled: ${displayDate}): ${input}`, self: true, isScheduled: true }]);
    setInput(""); setShowOptions(false);
  };

  const toggleFriend = async () => {
      if (!partner || partner.type === 'ai') return;
      setFriendLoading(true);
      try {
          if (isFriend) {
              const res = await fetch("/api/friends", {
                  method: "DELETE",
                  body: JSON.stringify({ targetId: partner.externalId }),
                  headers: { "Content-Type": "application/json" }
              });
              if (res.ok) setIsFriend(false);
          } else {
              if (socket && user) socket.emit("add_friend", { targetId: partner.externalId, myId: user.id });
              setIsFriend(true);
          }
      } catch(e) { alert("Action failed"); }
      finally { setFriendLoading(false); }
  };

  const reset = () => { setStatus("idle"); setMode(null); setMessages([]); setPartner(null); setIsMutual(false); router.replace("/bridge"); };

  return (
    // UPDATED: Changed bg-pink-50 to bg-slate-50
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl space-y-8 text-center">
            <h1 className="text-5xl font-black text-slate-900">The Bridge</h1>
            <div className={`text-xs font-bold ${isConnected ? "text-green-500" : "text-red-500"}`}>{isConnected ? "● Server Connected" : "○ Connecting..."}</div>
            
            <div className="bg-white p-4 rounded-2xl inline-flex gap-4 shadow-sm border border-slate-100">
               <button onClick={() => setUserGender("Male")} className={`px-6 py-2 rounded-xl font-bold transition-all ${userGender === "Male" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>Male</button>
               <button onClick={() => setUserGender("Female")} className={`px-6 py-2 rounded-xl font-bold transition-all ${userGender === "Female" ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-400"}`}>Female</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button onClick={handleFindConnection} className="p-10 bg-white rounded-[40px] shadow-xl border-2 border-slate-100 hover:border-indigo-500 transition-all hover:scale-105">
                <User size={48} className="text-indigo-500 mb-4 mx-auto" />
                <h3 className="text-2xl font-bold text-slate-800">Find Connection</h3>
              </button>
              
              <div className="bg-white p-8 rounded-[40px] shadow-xl flex flex-col justify-center gap-4 border-2 border-slate-100">
                <p className="text-xs font-bold text-gray-400 uppercase">AI Companions</p>
                <div className="flex justify-center gap-4">
                   {Object.values(PERSONAS).map(ai => (
                    <button key={ai.id} onClick={() => {
                        setMode("ai"); setPartner({ id: ai.id, name: ai.name, type: "ai" }); setStatus("matched");
                        setMessages([{ text: `Hello, I'm ${ai.name}.`, self: false }]);
                    }} className={`p-4 rounded-3xl ${ai.color} hover:scale-110 transition-transform flex flex-col items-center gap-2`}>
                      <span className="text-2xl">{ai.icon}</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-black">{ai.name}</span>
                    </button>
                   ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {status === "matched" && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full max-w-md h-[700px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-100 relative">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center z-10">
              <button onClick={reset}><ArrowLeft size={20}/></button>
              <span className="font-bold flex items-center gap-2">{partner?.name} {isMutual && <span className="bg-pink-500 text-[10px] px-2 rounded-full">Mutual</span>}</span>
              
              <button onClick={toggleFriend} disabled={friendLoading} className="relative">
                {friendLoading ? <Loader2 className="animate-spin text-white" size={20} /> : (
                    <Heart size={20} className={isFriend ? "fill-pink-500 text-pink-500" : "text-white"} />
                )}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.self ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-3xl max-w-[80%] text-sm ${m.self ? (m.isScheduled ? "bg-indigo-100 text-indigo-800 border-2 border-indigo-200" : "bg-indigo-600 text-white") : "bg-white border border-slate-200 text-gray-800"}`}>{m.text}</div>
                  {!m.self && (
                      <button onClick={() => pinToMap(m.text)} className="mt-1 px-3 py-1 bg-pink-100 text-pink-600 text-[10px] font-bold rounded-full flex items-center gap-1 hover:bg-pink-200 transition-colors">
                          <MapPin size={10}/> Pin Memory
                      </button>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t border-slate-100 relative z-20">
                <AnimatePresence>
                {showOptions && mode === 'human' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-20 left-4 right-4 bg-slate-800 text-white p-6 rounded-3xl shadow-2xl mb-2">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Schedule Send</span><button onClick={() => setShowOptions(false)}><X size={16}/></button></div>
                        {!isMutual ? <p className="text-center text-slate-400 text-xs">🔒 Mutual Friendship Required</p> : (
                            <div className="space-y-4"><input type="datetime-local" className="w-full bg-slate-700 p-3 rounded-xl text-white outline-none" onChange={(e) => setScheduleDate(e.target.value)} /><button onClick={handleSchedule} className="w-full py-3 bg-pink-600 rounded-xl font-bold flex items-center justify-center gap-2"><Clock size={16}/> Schedule Message</button></div>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>

                <AnimatePresence>
                {showEmojis && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-20 left-4 right-4 bg-white border p-3 rounded-2xl shadow-xl mb-2 flex flex-wrap gap-2 justify-center">
                        {EMOJIS.map(e => (
                            <button key={e} onClick={() => setInput(prev => prev + e)} className="text-2xl hover:scale-125 transition-transform">{e}</button>
                        ))}
                        <button onClick={() => setShowEmojis(false)} className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1"><X size={12}/></button>
                    </motion.div>
                )}
                </AnimatePresence>

                <form onSubmit={sendMessage} className="flex gap-2 items-center">
                    {mode === 'human' && <button type="button" onClick={() => setShowOptions(!showOptions)} className={`p-3 rounded-full transition-colors ${showOptions ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}><Plus size={20} className={showOptions ? "rotate-45" : ""}/></button>}
                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Message..." className="flex-1 p-3 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
                    <button type="button" onClick={() => setShowEmojis(!showEmojis)} className={`p-2 transition-colors ${showEmojis ? "text-pink-500" : "text-slate-400 hover:text-pink-500"}`}><Smile size={24}/></button>
                    <button type="submit" className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 active:scale-95"><Send size={18}/></button>
                </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}