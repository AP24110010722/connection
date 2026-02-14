"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import MapView from "@/components/MapView";
import { motion } from "framer-motion";
import { Plus, Users, Heart, Trash2, HeartHandshake } from "lucide-react";
import Link from "next/link";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function MemoryMapPage() {
  const { user: currentUser, isLoaded } = useUser();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isLoaded && currentUser) {
      socket.emit("user_joined", { externalId: currentUser.id, name: currentUser.firstName });
    }
    socket.on("online_users_update", (users) => setOnlineUsers(users));
    return () => { socket.off("online_users_update"); };
  }, [currentUser, isLoaded]);

  const uniqueFriends = onlineUsers
    .filter(u => u.externalId !== currentUser?.id)
    .filter((v, i, a) => a.findIndex(t => t.externalId === v.externalId) === i);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-10">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 h-[650px]"><MapView /></div>
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border flex flex-col h-[650px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 flex items-center gap-3"><Users size={20} className="text-pink-600" /> Online Hearts</h3>
            <div className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black rounded-full uppercase">{uniqueFriends.length} Active</div>
          </div>
          <Link href="/friends" className="mb-6 w-full py-4 bg-pink-50 text-pink-600 rounded-[24px] font-bold flex items-center justify-center gap-2 hover:bg-pink-100 transition-all border border-pink-100"><HeartHandshake size={20}/> View Saved Friends</Link>
          <div className="flex-1 overflow-y-auto space-y-4">
            {uniqueFriends.map(friend => (
              <div key={friend.id} className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-xl">❤️</div>
                <div><p className="text-sm font-bold text-slate-800">{friend.name}</p><span className="text-[10px] text-green-500 font-bold uppercase">Online</span></div>
              </div>
            ))}
            {uniqueFriends.length === 0 && <p className="text-center text-slate-400 text-xs italic mt-10">Searching for other hearts... ❤️</p>}
          </div>
        </div>
      </div>
    </div>
  );
}