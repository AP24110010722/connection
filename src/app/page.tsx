"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Map as MapIcon, PenTool } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-full shadow-xl">
            <Heart className="text-pink-500 fill-pink-500" size={48} />
          </div>
        </div>
        
        <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tight">
          Heart<span className="text-pink-500">Bridge</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          Connecting hearts, not just accounts. A digital sanctuary to talk, 
          express feelings, and preserve memories.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            href="/bridge" 
            icon={<MessageCircle className="text-purple-500" />} 
            title="The Bridge" 
            desc="Connect with empathetic AI or human listeners."
          />
          <FeatureCard 
            href="/letters" 
            icon={<PenTool className="text-orange-500" />} 
            title="Heart Notes" 
            desc="AI-powered letters to express what words can't."
          />
          <FeatureCard 
            href="/map" 
            icon={<MapIcon className="text-indigo-500" />} 
            title="MemoryMap" 
            desc="Pin your emotional journey on a global map."
          />
        </div>

        <Link href="/bridge">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-2xl hover:bg-gray-800 transition-all"
          >
            Start Your Journey
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

function FeatureCard({ href, icon, title, desc }: { href: string, icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Link href={href}>
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group">
        <div className="mb-4 bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-snug">{desc}</p>
      </div>
    </Link>
  );
}