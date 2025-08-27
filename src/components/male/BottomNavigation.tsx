'use client';

import { usePathname, useRouter } from "next/navigation";
import { Home, Search, User, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", icon: <Home className="h-6 w-6" />, label: "Home" },
  { href: "/search-categories", icon: <Search className="h-6 w-6" />, label: "Search" },
  { href: "/analysis-v2/force", icon: <UserCircle className="h-6 w-6" />, label: "Analysis" },
  { href: "/login", icon: <User className="h-6 w-6" />, label: "Profile" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90vw] sm:w-[50vw] md:w-[30vw] 
      bg-slate-800 text-white flex justify-around items-center py-3 px-4 rounded-2xl shadow-lg
      backdrop-blur-md border border-slate-700 z-50">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <button
            key={index}
            onClick={() => router.push(item.href)}
            className="relative flex flex-col items-center focus:outline-none"
          >
            <motion.div
              animate={{
                scale: isActive ? 1.2 : 1,
                color: isActive ? "#60A5FA" : "#ffffff", // blue-400 when active
              }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex flex-col items-center"
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </motion.div>
          </button>
        );
      })}
    </nav>
  );
}
