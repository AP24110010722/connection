"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Heart } from "lucide-react";

export default function LetterPage() {
  const [recipient, setRecipient] = useState("");
  const [vibe, setVibe] = useState("Romantic");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const generateLetter = async () => {
    setLoading(true);
    // In a real app, you'd call an API route similar to the chat one
    // For the demo, we simulate the "Magic"
    setTimeout(() => {
      setLetter(`Dearest ${recipient},\n\nI was just thinking about how much brighter things feel when you're around. You have this way of making the small moments feel significant. Thanks for being you.\n\nWith love, [Me]`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8 flex flex-col items-center">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">Send a Heart Note 💌</h1>
        <p className="text-gray-500">Find the perfect words, powered by empathy.</p>
      </header>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-orange-100">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who is this for?</label>
            <input 
              type="text" 
              placeholder="Name of your person..."
              className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-300 outline-none transition-all"
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">What's the vibe?</label>
            <div className="flex gap-2">
              {["Romantic", "Funny", "Supportive"].map((v) => (
                <button
                  key={v}
                  onClick={() => setVibe(v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    vibe === v ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={generateLetter}
            disabled={!recipient || loading}
            className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Writing with love..." : <><Sparkles size={18} /> Generate Note</>}
          </button>
        </div>

        <AnimatePresence>
          {letter && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 bg-orange-50 rounded-2xl border-2 border-dashed border-orange-200 relative"
            >
              <p className="whitespace-pre-line text-gray-800 italic leading-relaxed">{letter}</p>
              <button className="mt-4 flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700">
                <Send size={16} /> Send via HeartBridge
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}