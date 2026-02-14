"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, MessageCircle, Trash2, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    try {
        const res = await fetch("/api/friends");
        const data = await res.json();
        setFriends(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Failed to load friends"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFriends(); }, []);

  const removeFriend = async (id: string) => {
    if(!confirm("Remove this friend?")) return;
    try {
        await fetch("/api/friends", {
            method: "DELETE",
            body: JSON.stringify({ targetId: id }),
            headers: { "Content-Type": "application/json" }
        });
        fetchFriends(); 
    } catch(e) { alert("Failed to remove friend"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10 pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              Your Hearts <Heart className="text-pink-500" fill="currentColor" />
            </h1>
            <Link href="/bridge" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">Open Bridge</Link>
        </div>
        
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
        ) : (
            <div className="space-y-4">
              {friends.map((friend) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={friend.externalId} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500"><User size={28} /></div>
                    <h3 className="font-bold text-slate-800">{friend.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/bridge?dm=${friend.externalId}&name=${friend.name}`} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                        <MessageCircle size={18} />
                    </Link>
                    <button onClick={() => removeFriend(friend.externalId)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100">
                        <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {friends.length === 0 && <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 text-slate-400 italic">No hearts saved yet. ❤️</div>}
            </div>
        )}
      </div>
    </div>
  );
}