"use client";

import Link from "next/link";
import { Heart, Map as MapIcon, MessageSquare, Users, PenTool, LogIn } from "lucide-react";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-white/50 px-6 py-4 rounded-full shadow-2xl z-[5000] flex items-center gap-6">
      
      {/* 1. Standard Navigation Links */}
      <Link href="/" className="text-slate-400 hover:text-indigo-600 transition-colors p-2">
        <Heart size={24} />
      </Link>
      <Link href="/bridge" className="text-slate-400 hover:text-indigo-600 transition-colors p-2">
        <MessageSquare size={24} />
      </Link>
      <Link href="/map" className="text-slate-400 hover:text-indigo-600 transition-colors p-2">
        <MapIcon size={24} />
      </Link>
      <Link href="/friends" className="text-slate-400 hover:text-indigo-600 transition-colors p-2">
        <Users size={24} />
      </Link>
      <Link href="/letters" className="text-slate-400 hover:text-indigo-600 transition-colors p-2">
        <PenTool size={24} />
      </Link>

      {/* 2. AUTHENTICATION BUTTONS */}
      <div className="pl-4 border-l border-slate-200 ml-2">
        
        {/* If user is LOGGED IN -> Show Profile Bubble (Click to Logout) */}
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        {/* If user is LOGGED OUT -> Show Sign In Icon */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="text-slate-400 hover:text-green-600 transition-colors pt-1">
              <LogIn size={24} />
            </button>
          </SignInButton>
        </SignedOut>
        
      </div>

    </nav>
  );
}