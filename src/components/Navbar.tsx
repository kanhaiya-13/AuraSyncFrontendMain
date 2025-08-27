'use client';

import React, { useState, useRef, useEffect, Children, cloneElement } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiHome, FiBookOpen, FiSearch, FiUser, FiShoppingBag } from 'react-icons/fi';
import { useMediaQuery } from 'react-responsive';

const NavItem = ({
  children,
  className = "",
  onClick,
  mouseX,
  mouseY,
  spring,
  distance,
  magnification,
  baseItemSize,
  isMobile
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mouseX: any;
  mouseY: any;
  spring: any;
  distance: number;
  magnification: number;
  baseItemSize: number;
  isMobile: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(isMobile ? mouseX : mouseY, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      y: 0,
      width: baseItemSize,
      height: baseItemSize
    };
    return isMobile
      ? val - rect.x - baseItemSize / 2
      : val - rect.y - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-lg bg-gray-900 shadow-md focus:outline-none ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement, { isHovered, isMobile })
      )}
    </motion.div>
  );
};

const NavIcon = ({ children, className = "" }: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex items-center justify-center text-white ${className}`}>
    {children}
  </div>
);

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [menuTopPosition, setMenuTopPosition] = useState('50%');

  const items = [
    { icon: <FiHome size={20} />, label: "Home", onClick: () => router.push('/') },
    { icon: <FiSearch size={20} />, label: "Search", onClick: () => router.push('/search-categories') },
    { icon: <FiShoppingBag size={20} />, label: "Analysis", onClick: () => router.push('/analysis-v2/force') },
    { icon: <FiUser size={20} />, label: "Profile", onClick: () => router.push('/login') },
    { icon: <FiBookOpen size={20} />, label: "About", onClick: () => router.push('/about') },
  ];

  // Ensure client-side rendering only
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleAnimationComplete = () => {
      setTimeout(() => setIsVisible(true), 500);
    };
    window.addEventListener('landingAnimationComplete', handleAnimationComplete);
    return () => {
      window.removeEventListener('landingAnimationComplete', handleAnimationComplete);
    };
  }, []);

  useEffect(() => {
    const calculateMenuPosition = () => {
      const heading = document.getElementById('hero-heading');
      if (heading && !isMobile) {
        const headingRect = heading.getBoundingClientRect();
        const headingCenter = headingRect.top + headingRect.height / 2;
        const adjustedPosition = headingCenter - 89;
        setMenuTopPosition(`${adjustedPosition}px`);
      }
    };
    calculateMenuPosition();
    window.addEventListener('resize', calculateMenuPosition);
    const timeoutId = setTimeout(calculateMenuPosition, 100);
    return () => {
      window.removeEventListener('resize', calculateMenuPosition);
      clearTimeout(timeoutId);
    };
  }, [isMobile, isVisible]);

  if (!mounted) return null; // prevents hydration error

  return (
    <motion.div
      key="navbar"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed ${isMobile ? "bottom-4 left-1/2 -translate-x-1/2" : "left-4"} z-50`}
      style={{
        top: isMobile ? undefined : menuTopPosition,
        transform: isMobile ? undefined : 'translateY(-50%)',
        pointerEvents: isVisible ? "auto" : "none"
      }}
    >
      <motion.div
        onMouseMove={({ clientX, clientY }) => {
          isHovered.set(1);
          mouseX.set(clientX);
          mouseY.set(clientY);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
          mouseY.set(Infinity);
        }}
        className={`flex ${isMobile ? "flex-row divide-x" : "flex-col divide-y"} 
          divide-gray-700 items-center gap-3 p-2 rounded-full 
          bg-gray-900 backdrop-blur-md border border-gray-700 shadow-lg`}
        role="toolbar"
        aria-label="Application navigation"
      >
        {items.map((item, index) => (
          <NavItem
            key={index}
            onClick={item.onClick}
            mouseX={mouseX}
            mouseY={mouseY}
            spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
            distance={100}
            magnification={72}
            baseItemSize={48}
            isMobile={isMobile}
          >
            <NavIcon>{item.icon}</NavIcon>
          </NavItem>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Navbar;
