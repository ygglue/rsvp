"use client";

import { useState, useEffect } from "react";
import Confetti from "@/components/Confetti";

export default function SuccessPage() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const diff = new Date("2026-07-06T18:00:00").getTime() - Date.now();
    setDays(Math.max(0, Math.floor(diff / 86400000)));
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      <Confetti />

      <div className="relative -z-10 w-full max-w-lg stagger-1">
        <div className="text-center space-y-2 mb-10">
          <p className="text-[#8CB4E8] text-xs uppercase tracking-[0.25em] font-medium">
            RSVP Received
          </p>
          <h1 className="font-display text-5xl sm:text-6xl italic text-[#FFD700] leading-[1.1]">
            Thank You!
          </h1>
        </div>

        <div className="bg-[#102F5C]/40 backdrop-blur-md rounded-2xl border border-[#1A447A]/30 p-8 shadow-2xl text-center space-y-6">
          <div className="space-y-3">
            <p className="text-[#E8F0FF] text-lg leading-relaxed">
              Your RSVP has been received. We can&apos;t wait to celebrate with you on July 6th.
            </p>
            <div className="w-12 h-0.5 bg-[#FFD700]/50 mx-auto" />
          </div>

          <div className="bg-[#0A1E3F]/60 rounded-xl p-5 space-y-3">
            <p className="font-display text-xl italic text-[#FFD700]">
              Anne&apos;s 18th Birthday
            </p>
            <div className="text-sm text-[#B0C8E8] space-y-1">
              <p>July 6, 2026 · 6:00 PM</p>
              <p>Mangrove at Sunlight Hotel Puerto Princesa</p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-[#8CB4E8] text-xs uppercase tracking-[0.2em] font-medium">
              Countdown
            </p>
            <p className="sheen-text text-5xl font-display italic leading-none">
              {days}
            </p>
            <p className="text-[#B0C8E8] text-sm -mt-1">
              day{days !== 1 ? "s" : ""} until
            </p>
            <p className="sheen-text text-xl font-display italic leading-[1.15]">
              Anne&apos;s 18th Birthday
            </p>
            <p className="text-[#E8F0FF] text-sm font-display">
              and you are invited!
            </p>
          </div>

          <p className="text-[#5A7AAC] text-xs">
            Check your email for confirmation details.
          </p>
        </div>
      </div>
    </main>
  );
}
