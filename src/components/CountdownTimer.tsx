"use client";

import { useState, useEffect } from "react";

const EVENT = new Date("2026-07-06T18:00:00").getTime();

export default function CountdownTimer() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    function tick() {
      const diff = EVENT - Date.now();
      setDays(Math.max(0, Math.floor(diff / 86400000)));
    }
    tick();
    const id = setInterval(tick, 3600000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-center space-y-4">
      {/* It's */}
      <p className="text-[#8CB4E8] text-xs sm:text-sm tracking-[0.25em] uppercase font-medium mb-2">
        <span className="inline-block mr-3 opacity-50">✦</span>
        It&apos;s
        <span className="inline-block ml-3 opacity-50">✦</span>
      </p>

      {/* Decorative rule */}
      <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#FFCC00]/20 to-transparent mx-auto -mb-1" />

      {/* Hero number */}
      <div className="py-1">
        <p
          className="sheen-text text-7xl sm:text-8xl lg:text-9xl font-display italic leading-none animate-[float_4s_ease-in-out_infinite]"
          style={{ filter: "drop-shadow(0 0 30px rgba(212, 175, 55, 0.15))" }}
        >
          {days}
        </p>
      </div>

      {/* days until */}
      <div className="space-y-1">
        <div className="w-12 h-px bg-[#D4AF37]/30 mx-auto mb-2" />
        <p className="text-[#B0C8E8] text-xs sm:text-sm tracking-[0.15em] uppercase">
          day{days !== 1 ? "s" : ""} until
        </p>
      </div>

      {/* Title */}
      <div className="space-y-1 pt-1">
        <p className="sheen-text text-6xl sm:text-8xl lg:text-10xl font-display italic leading-[1.15]">
          Anne&apos;s
        </p>
        <p className="sheen-text text-6xl sm:text-8xl lg:text-10xl font-display italic leading-[1.15]">
          18th Birthday
        </p>
      </div>

      {/* Invitation */}
      <div className="flex items-center justify-center gap-3 pt-1">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#FFCC00]/30" />
        <span className="text-[#B8860B] text-[8px] tracking-[0.3em] uppercase font-medium">
          ✦
        </span>
        <p className="text-[#E8F0FF] text-lg sm:text-xl font-display italic">
          and you are invited!
        </p>
        <span className="text-[#B8860B] text-[8px] tracking-[0.3em] uppercase font-medium">
          ✦
        </span>
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#FFCC00]/30" />
      </div>
    </div>
  );
}
