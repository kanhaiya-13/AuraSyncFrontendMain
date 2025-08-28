"use client";

import { Home, Search, User, UserCircle } from "lucide-react";
import Image from "next/image";
import HairIcon from '@/app/assets/iconHair.png'
import { useEffect, useState } from "react";

export default function BottomNav() {

 const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      console.log(currentY);

      // 👉 change 200 to whatever height you want
      if (currentY > 200) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // run once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav className={` ${scrolled?"hidden":"fixed"}   bottom-10 left-1/2 -translate-x-1/2 bg-neutral-800 text-white flex items-center justify-around gap-4 px-6 py-3 rounded-2xl shadow-lg w-[70%] max-w-md`}>
      {/* Home */}
      <button className="flex flex-col items-center">
        <Home className="h-8 w-8" />
      </button>

      <div className="h-6 w-px bg-gray-600" />

      {/* Search */}
      <button className="flex flex-col items-center">
        <Search className="h-8 w-8" />
      </button>

      <div className="h-6 w-px bg-gray-600" />

      {/* UserCircle */}
      <button className="flex flex-col items-center">
        <Image src={HairIcon} width={30} height={20} alt="hair icon"/>
      </button>

      <div className="h-6 w-px bg-gray-600" />

      {/* Profile */}
      <button className="flex flex-col items-center">
        <User className="h-8 w-8" />
      </button>
    </nav>
  );
}
