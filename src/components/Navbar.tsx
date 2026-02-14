import Link from "next/link";
import { Heart, Map as MapIcon, MessageSquare, Users, PenTool } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white/50 px-8 py-4 rounded-full shadow-2xl z-[5000] flex items-center gap-8">
      <Link href="/" className="text-slate-400 hover:text-indigo-600 transition-colors">
        <Heart size={24} />
      </Link>
      <Link href="/bridge" className="text-slate-400 hover:text-indigo-600 transition-colors">
        <MessageSquare size={24} />
      </Link>
      <Link href="/map" className="text-slate-400 hover:text-indigo-600 transition-colors">
        <MapIcon size={24} />
      </Link>
      {/* NEW FRIENDS TAB */}
      <Link href="/friends" className="text-slate-400 hover:text-indigo-600 transition-colors">
        <Users size={24} />
      </Link>
      <Link href="/letters" className="text-slate-400 hover:text-indigo-600 transition-colors">
        <PenTool size={24} />
      </Link>
    </nav>
  );
}