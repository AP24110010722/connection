"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, MessageCircle, Trash2, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function FriendsPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFriends = async () => {
    try {
        const res = await fetch("/api/friends");
        const data = await res.json();
        setFriends(data);
    } catch (e) { console.error("Failed to load friends"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFriends(); }, []);

  const removeFriend = async (id: string) => {
    if(!confirm("Are you sure you want to remove this friend?")) return;
    
    setRemovingId(id); // Show loading spinner on this specific button
    
    try {
        const res = await fetch("/api/friends", {
            method: "DELETE",
            body: JSON.stringify({ targetId: id }),
            headers: { "Content-Type": "application/json" }
        });
        
        if (res.ok) {
            // Update UI instantly without waiting for refresh
            setFriends(prev => prev.filter(f => f.externalId !== id));
        } else {
            alert("Server failed to remove friend.");
        }
    } catch(e) { 
        alert("Network error."); 
    } finally {
        setRemovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">Saved Hearts <Heart className="text-pink-500" fill="currentColor" /></h1>
            <Link href="/bridge" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors">Back to Bridge</Link>
        </div>
        
        {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
        ) : (
            <div className="space-y-4">
              {friends.map((friend) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={friend.externalId} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500"><User size={28} /></div>
                    <div><h3 className="font-bold text-slate-800">{friend.name}</h3></div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/bridge?dm=${friend.externalId}&name=${friend.name}`} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors">
                        <MessageCircle size={18} />
                    </Link>
                    
                    <button 
                        onClick={() => removeFriend(friend.externalId)} 
                        disabled={removingId === friend.externalId}
                        className={`p-3 rounded-xl transition-all ${removingId === friend.externalId ? "bg-slate-100 text-slate-400" : "bg-red-50 text-red-400 hover:bg-red-100"}`}
                    >
                        {removingId === friend.externalId ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18} />}
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {friends.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-medium italic">No friends yet.</p>
                  </div>
              )}
            </div>
        )}
      </div>
    </div>
  );
}