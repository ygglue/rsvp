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
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 lg:p-12 py-30 lg:py-30">
      {/* Flower decorations */}
      {groups.map((g, gi) => (
        <div
          key={gi}
          className="fixed pointer-events-none z-20"
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
            const swayDegree = (((gi * 7 + fi * 13) % 20) + 30) / 10;
            const swayDuration = (((gi * 5 + fi * 11) % 20) + 40) / 10;
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
                  style={
                    {
                      "--sway-degree": `${swayDegree}deg`,
                      "--sway-duration": `${swayDuration}s`,
                      "--sway-delay": `${swayDelay}s`,
                      transformOrigin: f.origin,
                    } as React.CSSProperties
                  }
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

      {/* Content Grid */}
      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-16 items-start">
        {/* Left: Event Info */}
        <div className="space-y-10 lg:space-y-12 pt-4 lg:pt-12">
          <div className="stagger-1">
            <CountdownTimer />
          </div>

          <div className="stagger-2 space-y-3">
            <p className="text-[#8CB4E8] text-xs uppercase tracking-[0.2em] font-medium">
              Date &amp; Time
            </p>
            <p className="text-[#E8F0FF] text-xl sm:text-2xl font-display">
              July 6, 2026
            </p>
            <p className="text-[#B0C8E8] text-base">6:00 PM &middot; Evening</p>
          </div>

          <div className="stagger-3 space-y-3">
            <p className="text-[#8CB4E8] text-xs uppercase tracking-[0.2em] font-medium">
              Venue
            </p>
            <p className="text-[#E8F0FF] text-xl sm:text-2xl font-display">
              Villa El Dantess
            </p>
            <div className="rounded-xl overflow-hidden border border-[#1A447A]/40 mt-3">
              <iframe
                src="https://maps.google.com/maps?q=Villa+El+Dantess&output=embed"
                width="100%"
                height="160"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          <div className="stagger-4 space-y-4">
            <p className="text-[#8CB4E8] text-xs uppercase tracking-[0.2em] font-medium">
              Attire
            </p>
            <p className="text-[#E8F0FF] text-lg font-display">
              Dark Blue Palette
            </p>
            <ColorPalette />
            <Image
              src="/images/outfit.jpg"
              alt="Outfit example"
              width={300}
              height={400}
              className="w-full rounded-xl border border-[#1A447A]/40"
            />
            <p className="text-[#8CB4E8]/70 text-xs italic">
              We kindly ask that you do your best to follow the attire theme.
            </p>
          </div>
        </div>

        {/* Right: RSVP Form */}
        <div className="stagger-3 lg:stagger-6 lg:pt-8">
          <div className="relative bg-[#102F5C]/40 backdrop-blur-md rounded-2xl border border-[#1A447A]/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Gradient mesh overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle at 30% 20%, rgba(42, 90, 150, 0.12), transparent 60%),
                  radial-gradient(circle at 70% 80%, rgba(26, 68, 122, 0.08), transparent 50%)
                `,
              }}
            />

            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl italic text-[#FFD700] mb-8">
                Enter your details to confirm your attendance
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs text-[#8CB4E8] uppercase tracking-[0.15em] mb-1.5 font-medium"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-glow mt-1 block w-full rounded-xl bg-[#0A1E3F]/60 border border-[#1A447A]/50 px-4 py-3 text-sm text-[#E8F0FF] placeholder-[#5A7AAC] transition-all duration-300 focus:outline-none focus:border-[#2A5A96]"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs text-[#8CB4E8] uppercase tracking-[0.15em] mb-1.5 font-medium"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-glow mt-1 block w-full rounded-xl bg-[#0A1E3F]/60 border border-[#1A447A]/50 px-4 py-3 text-sm text-[#E8F0FF] placeholder-[#5A7AAC] transition-all duration-300 focus:outline-none focus:border-[#2A5A96]"
                    placeholder="your@email.com"
                  />
                </div>

                {error && (
                  <p className="text-rose-300 text-sm bg-rose-900/20 border border-rose-800/30 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-shimmer w-full text-white py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-[#2A5A96]/25 hover:shadow-xl active:scale-[0.98]"
                >
                  {loading ? "Submitting..." : "Submit RSVP"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
