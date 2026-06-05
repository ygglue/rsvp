"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { groups, originTranslate, REF_W } from "@/data/flowers";
import Confetti from "@/components/Confetti";

export default function SuccessPage() {
  const [vwScale, setVwScale] = useState(1);

  useEffect(() => {
    const update = () => setVwScale(Math.max(0.4, window.innerWidth / REF_W));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      <Confetti />

      <div className="bg-[#0A1E3F]/85 backdrop-blur-md rounded-2xl shadow-2xl border border-[#2A5A96]/40 w-full max-w-md text-center space-y-6 z-10 p-8">
        <h1 className="text-3xl font-serif italic text-[#FFD700]">Thank You!</h1>
        <div className="w-12 h-0.5 bg-[#1A447A] mx-auto" />
        <p className="text-blue-100 leading-relaxed">
          Your RSVP has been received. We can&apos;t wait to celebrate with you!
        </p>
        <div className="bg-[#102F5C]/60 rounded-lg p-4 space-y-1 text-sm">
          <p className="text-[#FFD700] font-medium">Anne&apos;s 18th Birthday</p>
          <p className="text-blue-200">July 6, 2026 · 6:00 PM</p>
          <p className="text-blue-200">Villa El Dantess</p>
        </div>
        <p className="text-blue-400 text-sm">
          Check your email for confirmation details.
        </p>
      </div>
    </main>
  );
}
