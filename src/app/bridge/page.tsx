"use client";

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Heartbeat from "@/components/Heartbeat";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, MessageCircle, ArrowLeft } from "lucide-react";

// Connect to the standalone Node.js server
const socket = io("http://localhost:3001");

export default function BridgePage() {
  const [status, setStatus] = useState<"idle" | "waiting" | "matched">("idle");
  const [partner, setPartner] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<{ sender: string; text: string; self: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [waitTime, setWaitTime] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Socket Events
  useEffect(() => {
    socket.on("waiting", () => {
      setStatus("waiting");
    });

    socket.on("match_found", (data) => {
      setStatus("matched");
      setPartner({ id: data.partnerId, name: data.partnerName });
    });

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, { sender: "Partner", text: data.text, self: false }]);
    });

    socket.on("partner_disconnected", () => {
      alert("Your partner has disconnected.");
      resetBridge();
    });

    return () => {
      socket.off("waiting");
      socket.off("match_found");
      socket.off("receive_message");
      socket.off("partner_disconnected");
    };
  }, []);

  // Timer for Waiting Room
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "waiting") {
      interval = setInterval(() => setWaitTime((prev) => prev + 1), 1000);
    } else {
      setWaitTime(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const startFinding = () => {
    socket.emit("find_connection", { name: "A Kind Soul" });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && partner) {
      socket.emit("send_message", { to: partner.id, text: input });
      setMessages((prev) => [...prev, { sender: "Me", text: input, self: true }]);
      setInput("");
    }
  };

  const resetBridge = () => {
    setStatus("idle");
    setPartner(null);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        
        {/* IDLE STATE: Initial Landing */}
        {status === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl font-black text-gray-900">The Bridge</h1>
            <p className="text-gray-600 max-w-sm">Ready to connect with a fellow human heart?</p>
            <button 
              onClick={startFinding}
              className="px-12 py-4 bg-pink-500 text-white rounded-full font-bold shadow-xl hover:bg-pink-600 transition-all scale-105 active:scale-95"
            >
              Find a Connection
            </button>
          </motion.div>
        )}

        {/* WAITING STATE: Matching Animation */}
        {status === "waiting" && (
          <motion.div 
            key="waiting"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center space-y-8"
          >
            <Heartbeat isSyncing={false} />
            <div>
              <h2 className="text-2xl font-bold text-pink-600">Searching...</h2>
              <p className="text-gray-500">Wait time: {waitTime}s</p>
            </div>
            {waitTime > 15 && (
              <p className="text-sm text-pink-400 italic animate-pulse">
                Taking a while? No one might be online. Try again later or talk to AI!
              </p>
            )}
            <button onClick={resetBridge} className="text-gray-400 text-sm underline">Cancel</button>
          </motion.div>
        )}

        {/* MATCHED STATE: Real-time Chat */}
        {status === "matched" && (
          <motion.div 
            key="matched"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-pink-100"
          >
            {/* Chat Header */}
            <div className="p-6 bg-pink-500 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full"><User size={20} /></div>
                <div>
                  <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Connected with</p>
                  <p className="font-bold text-lg">{partner?.name}</p>
                </div>
              </div>
              <Heartbeat isSyncing={true} />
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.self ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.self ? "bg-pink-500 text-white rounded-br-none" : "bg-white text-gray-800 shadow-sm rounded-bl-none"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a heartfelt message..."
                className="flex-1 p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 ring-pink-300 transition-all text-sm text-black"
              />
              <button type="submit" className="p-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}