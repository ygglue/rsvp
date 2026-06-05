"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitRsvp } from "@/lib/actions";
import Image from "next/image";
import { groups, originTranslate, visualConfig, REF_W } from "@/data/flowers";
import CountdownTimer from "@/components/CountdownTimer";
import ColorPalette from "@/components/ColorPalette";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [vwScale, setVwScale] = useState(1);

  useEffect(() => {
    const update = () => setVwScale(Math.max(0.4, window.innerWidth / REF_W));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitRsvp({ name, email });

    if (result.success) {
      router.push("/success");
    } else {
      setError(result.error ?? "Something went wrong");
      setLoading(false);
    }
  }

  const flowerFilter = `hue-rotate(${visualConfig.hueRotate}deg) brightness(${visualConfig.brightness}) saturate(${visualConfig.saturate})`;

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-6">
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
            const swayDegree = ((gi * 7 + fi * 13) % 20 + 30) / 10;
            const swayDuration = ((gi * 5 + fi * 11) % 20 + 40) / 10;
            const swayDelay = (((gi * 3 + fi * 7) % 30) * -1) / 10;
            return (
              <div
                key={fi}
                className="absolute w-96"
                style={{
                  left: f.offsetX,
                  top: f.offsetY,
                  zIndex: f.zIndex ?? 10,
                }}
              >
                <div
                  className="flower-sway"
                  style={{
                    "--sway-degree": `${swayDegree}deg`,
                    "--sway-duration": `${swayDuration}s`,
                    "--sway-delay": `${swayDelay}s`,
                    transformOrigin: f.origin,
                  } as React.CSSProperties}
                >
                  <div
                    style={{
                      transform: `translate(${tx}%, ${ty}%) rotate(${f.rotation}deg) scale(${f.scale / 100})`,
                      transformOrigin: f.origin,
                    }}
                  >
                    <Image
                      src={f.path}
                      alt=""
                      width={400}
                      height={400}
                      priority={gi === 0}
                      style={{ filter: flowerFilter }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="w-full max-w-lg z-10">
        {/* Event Card */}
        <div className="bg-[#0A1E3F]/85 backdrop-blur-md rounded-2xl shadow-2xl border border-[#2A5A96]/40 p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl sm:text-4xl font-serif italic text-[#FFD700]">
              Anne&apos;s 18th Birthday
            </h1>
            <div className="flex items-center justify-center gap-2 text-blue-200 text-sm">
              <span>July 6, 2026</span>
              <span className="text-[#1A447A]">·</span>
              <span>6:00 PM</span>
            </div>
          </div>

          {/* Venue */}
          <div className="text-center space-y-2">
            <p className="text-blue-100 font-medium">Villa El Dantess</p>
            <div className="rounded-xl overflow-hidden border border-[#1A447A]/50">
              <iframe
                src="https://maps.google.com/maps?q=Villa+El+Dantess&output=embed"
                width="100%"
                height="180"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <a
              href="https://maps.app.goo.gl/WZVwoYwnvW2nuh61A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-[#8CB4E8] hover:text-[#FFD700] transition-colors underline underline-offset-2"
            >
              View on Google Maps →
            </a>
          </div>

          {/* Attire */}
          <div className="text-center space-y-2">
            <p className="text-sm text-blue-200 uppercase tracking-wider font-medium">
              Attire: Dark Blue Palette
            </p>
            <ColorPalette />
          </div>

          {/* Countdown */}
          <div className="text-center">
            <CountdownTimer />
          </div>

          {/* Divider */}
          <div className="border-t border-[#1A447A]/50" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-blue-200">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg bg-[#102F5C]/60 border border-[#1A447A] px-4 py-3 text-sm text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2A5A96] focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-200">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg bg-[#102F5C]/60 border border-[#1A447A] px-4 py-3 text-sm text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-[#2A5A96] focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            {error && (
              <p className="text-rose-300 text-sm bg-rose-900/30 p-2 rounded">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1A447A] to-[#2A5A96] text-white py-3 px-4 rounded-lg text-sm font-medium hover:from-[#2A5A96] hover:to-[#3A6AA6] transition-all disabled:opacity-50 shadow-lg"
            >
              {loading ? "Submitting..." : "Submit RSVP"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
