"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitRsvp } from "@/lib/actions";
import Image from "next/image";
import { groups, originTranslate, REF_W } from "@/data/flowers";

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
                    <Image src={f.path} alt="" width={400} height={400} priority loading="eager" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 z-10 border border-white/50"
      >
        <h1 className="text-3xl font-serif text-slate-800 text-center italic">RSVP</h1>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-slate-500 focus:ring-slate-500 shadow-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-slate-500 focus:ring-slate-500 shadow-sm"
          />
        </div>

        {error && <p className="text-rose-600 text-sm bg-rose-50 p-2 rounded">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-slate-800 text-white py-3 px-4 rounded-md text-sm font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 shadow-md"
        >
          {loading ? "Submitting..." : "Submit RSVP"}
        </button>
      </form>
    </main>
  );
}
