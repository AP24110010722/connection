"use client";
import MapView from "@/components/MapView";
import { Plus, Camera, MessageSquare } from "lucide-react";

export default function MemoryMapPage() {
  return (
    <div className="min-h-screen bg-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold text-indigo-900">Our Story Map 🗺️</h1>
            <p className="text-indigo-600">Every pin is a heartbeat we shared.</p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg transition-all">
            <Plus size={20} /> Add Memory
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Map Area */}
          <div className="lg:col-span-2">
            <MapView />
          </div>

          {/* Side Feed: Recent Memories */}
          <div className="space-y-4">
            <h3 className="font-bold text-indigo-900 text-xl">Recent Moments</h3>
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 flex gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                  📸
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Favorite Café</h4>
                  <p className="text-sm text-gray-500">"Shared a coffee while talking to Luna..."</p>
                  <p className="text-[10px] text-indigo-400 mt-2 font-bold uppercase tracking-wider">Feb 20, 2026</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}