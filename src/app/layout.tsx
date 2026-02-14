import "./globals.css"; // Ensure you have a globals.css with @tailwind base; etc.
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="p-4 bg-white border-b flex justify-between items-center px-8">
          <span className="text-xl font-bold text-pink-500">❤️ HeartBridge</span>
          <div className="space-x-6 text-gray-600 font-medium">
            <a href="/bridge">Bridge</a>
            <a href="/letters">Letters</a>
            <a href="/map">MemoryMap</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}