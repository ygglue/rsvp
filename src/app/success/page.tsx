"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { groups, originTranslate, REF_W } from "@/data/flowers";

export default function SuccessPage() {
  const [vwScale, setVwScale] = useState(1);

  useEffect(() => {
    const update = () => setVwScale(Math.max(0.5, window.innerWidth / REF_W));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      {groups.map((g, gi) => (
        <div
          key={gi}
          className="fixed pointer-events-none z-0 opacity-90"
          style={{
            left: `${g.anchorX}%`,
            top: `${g.anchorY}%`,
            width: 0,
            height: 0,
            transform: `translate(-50%, -50%) scale(${vwScale})`,
            transformOrigin: "center",
          }}
        >
          {g.flowers.map((f, fi) => {
            const { tx, ty } = originTranslate(f.origin);
            return (
              <div
                key={fi}
                className="absolute w-96"
                style={{
                  left: f.offsetX,
                  top: f.offsetY,
                  zIndex: f.zIndex ?? 10,
                  transform: `translate(${tx}%, ${ty}%) rotate(${f.rotation}deg) scale(${f.scale / 100})`,
                  transformOrigin: f.origin,
                }}
              >
                <Image src={f.path} alt="" width={400} height={400} priority loading="eager" />
              </div>
            );
          })}
        </div>
      ))}

      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6 z-10 border border-white/50">
        <h1 className="text-3xl font-serif text-slate-800 italic">Thank You!</h1>
        <p className="text-slate-700">Your RSVP has been received. Please check your email for a confirmation.</p>
        <Link href="/" className="inline-block text-slate-600 text-sm hover:text-slate-900 underline underline-offset-4">
          Submit another
        </Link>
      </div>
    </main>
  );
}
