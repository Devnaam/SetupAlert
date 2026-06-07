"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate how far the section is scrolled into the viewport
        // Current distance from the bottom of the viewport to the top of the section
        const scrolledDistance = viewportHeight - rect.top;
        const totalScrollableDistance = viewportHeight + rect.height;
        
        if (scrolledDistance >= 0 && scrolledDistance <= totalScrollableDistance) {
          // Progress goes from 0 (just entering viewport) to 1 (just leaving viewport)
          const progress = scrolledDistance / totalScrollableDistance;
          setScrollProgress(progress);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Map progress (0 to 1) to horizontal pixel offsets
  // Top row moves left-to-right: from -800px to 0px
  const topRowX = -800 + scrollProgress * 800;
  // Bottom row moves right-to-left: from 0px to -800px
  const bottomRowX = scrollProgress * -800;

  return (
    <section ref={sectionRef} className="bg-[var(--color-bg-deep)] py-32 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px] z-20">
      
      {/* Scroll-Driven Typography Parallax Background */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center opacity-[0.03] select-none overflow-hidden">
        <div 
          className="whitespace-nowrap font-heading font-black text-[120px] md:text-[200px] leading-[1] uppercase tracking-tight flex gap-8"
          style={{ 
            transform: `translateX(${topRowX}px)`,
            willChange: 'transform'
          }}
        >
          <span>YOUR SETUP IS FORMING RIGHT NOW</span>
          <span>•</span>
          <span>YOUR SETUP IS FORMING RIGHT NOW</span>
          <span>•</span>
        </div>
        <div 
          className="whitespace-nowrap font-heading font-black text-[120px] md:text-[200px] leading-[1] uppercase tracking-tight flex gap-8"
          style={{ 
            transform: `translateX(${bottomRowX}px)`,
            willChange: 'transform',
            WebkitTextStroke: '3px var(--color-text)',
            color: 'transparent'
          }}
        >
          <span>SETUPALERT IS WATCHING</span>
          <span>•</span>
          <span>SETUPALERT IS WATCHING</span>
          <span>•</span>
          <span>SETUPALERT IS WATCHING</span>
        </div>
      </div>
      
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <h2 data-speed="-12" className="font-heading font-extrabold text-[40px] md:text-[56px] text-[var(--color-text)] mb-6 leading-[1.1] tracking-tight">
          Your setup is forming right now.
        </h2>
        <div data-speed="-18" className="flex flex-col items-center">
          <p className="text-[var(--color-text-muted)] text-[18px] md:text-[20px] font-medium mb-10">SetupAlert is watching.</p>
          <Link href="/alerts" className="min-h-[52px] inline-flex items-center justify-center bg-[var(--color-accent)] text-[var(--color-btn-text)] px-10 rounded-xl text-[18px] font-bold hover:opacity-90 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,173,181,0.3)] transition-all duration-300 focus-ring outline-none">
            Create Your First Alert — It's Free
          </Link>
        </div>
      </div>
    </section>
  );
}
