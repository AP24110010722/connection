"use client";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
      <Link href="/" className="text-2xl font-bold text-pink-500 flex items-center gap-2">
        ❤️ <span className="hidden md:inline">HeartBridge</span>
      </Link>
      
      <div className="flex items-center gap-6 font-medium text-gray-600">
        <Link href="/bridge" className="hover:text-pink-500 transition-colors">Bridge</Link>
        <Link href="/letters" className="hover:text-pink-500 transition-colors">Letters</Link>
        <Link href="/map" className="hover:text-pink-500 transition-colors">Map</Link>
        
        <div className="ml-4 pl-4 border-l border-gray-200">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm hover:bg-pink-600 transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}