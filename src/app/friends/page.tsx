"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, MessageCircle, Trash2, Heart } from "lucide-react";
import Link from "next/link";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    setFriends(JSON.parse(localStorage.getItem("hb_friends") || "[]"));
  }, []);

  const removeFriend = (id: string) => {
    const updated = friends.filter(f => f.id !== id);
    setFriends(updated);
    localStorage.setItem("hb_friends", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">Saved Hearts <Heart className="text-pink-500" fill="currentColor" /></h1>
            <Link href="/bridge" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm">Back to Bridge</Link>
        </div>
        <div className="space-y-4">
          {friends.map((friend) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={friend.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500"><User size={28} /></div>
                <div><h3 className="font-bold text-slate-800">{friend.name}</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Met on {friend.addedAt}</p></div>
              </div>
              <div className="flex gap-2"><button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100"><MessageCircle size={18} /></button><button onClick={() => removeFriend(friend.id)} className="p-3 bg-red-50 text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"><Trash2 size={18} /></button></div>
            </motion.div>
          ))}
          {friends.length === 0 && <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200"><p className="text-slate-400 font-medium italic">Your heart list is empty. Met someone new in the Bridge! ❤️</p></div>}
        </div>
      </div>
    </div>
  );
}