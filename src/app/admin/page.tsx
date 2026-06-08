"use client";

import { useState, useEffect } from "react";
import { adminLogin, getRsvps, sendTestEmail } from "@/lib/actions";

interface RsvpEntry {
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const ok = await adminLogin(password);
    if (ok) {
      setAuthed(true);
    } else {
      setError("Wrong password");
      setLoading(false);
    }
  }

  async function handleTestSend(e: React.FormEvent) {
    e.preventDefault();
    setTestResult(null);
    setTestLoading(true);

    const result = await sendTestEmail(testEmail);

    if (result.success) {
      setTestResult({ ok: true, msg: `Test email sent to ${testEmail}` });
    } else {
      setTestResult({ ok: false, msg: result.error ?? "Failed to send" });
    }
    setTestLoading(false);
  }

  useEffect(() => {
    if (authed) {
      getRsvps()
        .then((data) =>
          setRsvps(
            data.map((r) => ({
              ...r,
              createdAt: r.createdAt.toString(),
            })),
          ),
        )
        .catch(() => setError("Failed to load RSVPs"));
    }
  }, [authed]);

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0A1E3F]">
        <form
          onSubmit={handleLogin}
          className="bg-[#102F5C]/60 backdrop-blur-sm border border-[#1A447A]/30 p-8 rounded-2xl shadow-2xl w-full max-w-sm space-y-4"
        >
          <h1 className="text-2xl font-display italic text-[#FFD700] text-center">Admin</h1>
          <div>
            <label htmlFor="password" className="block text-xs text-[#8CB4E8] uppercase tracking-[0.15em] font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl bg-[#0A1E3F]/60 border border-[#1A447A]/50 px-4 py-3 text-sm text-[#E8F0FF] placeholder-[#5A7AAC] focus:outline-none focus:border-[#2A5A96] transition-all duration-300"
            />
          </div>
          {error && <p className="text-rose-300 text-sm bg-rose-900/20 border border-rose-800/30 rounded-lg px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A447A] text-white py-3 px-4 rounded-xl text-sm font-medium hover:bg-[#2A5A96] transition-all duration-300 disabled:opacity-50 shadow-lg"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A1E3F] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-display italic text-[#FFD700] mb-6">RSVPs</h1>

        {rsvps.length === 0 ? (
          <p className="text-[#B0C8E8]">No RSVPs yet.</p>
        ) : (
          <>
            <div className="sm:hidden space-y-3">
              {rsvps.map((r, i) => (
                <div key={i} className="bg-[#102F5C]/60 backdrop-blur-sm border border-[#1A447A]/30 rounded-2xl p-4 space-y-1 shadow-2xl">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-[#E8F0FF]">{r.name}</span>
                    <span className="text-xs text-[#8CB4E8] shrink-0 ml-2">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#B0C8E8] break-all">{r.email}</p>
                </div>
              ))}
            </div>

            <div className="hidden sm:block bg-[#102F5C]/60 backdrop-blur-sm border border-[#1A447A]/30 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-sm">
                <thead className="bg-[#0A1E3F]/60">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-[#8CB4E8] uppercase text-xs tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-[#8CB4E8] uppercase text-xs tracking-wider">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-[#8CB4E8] uppercase text-xs tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((r, i) => (
                    <tr key={i} className="border-t border-[#1A447A]/30">
                      <td className="px-4 py-3 text-[#E8F0FF]">{r.name}</td>
                      <td className="px-4 py-3 break-all text-[#B0C8E8]">{r.email}</td>
                      <td className="px-4 py-3 text-[#8CB4E8] whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="bg-[#102F5C]/60 backdrop-blur-sm border border-[#1A447A]/30 rounded-2xl p-6 mt-6 shadow-2xl">
          <h2 className="text-lg font-display italic text-[#FFD700] mb-1">Email Tester</h2>
          <p className="text-sm text-[#8CB4E8] mb-4">
            Send a test confirmation email to verify the email template.
          </p>
          <form onSubmit={handleTestSend} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              required
              placeholder="test@example.com"
              className="flex-1 rounded-xl bg-[#0A1E3F]/60 border border-[#1A447A]/50 px-4 py-3 text-sm text-[#E8F0FF] placeholder-[#5A7AAC] focus:outline-none focus:border-[#2A5A96] transition-all duration-300"
            />
            <button
              type="submit"
              disabled={testLoading}
              className="bg-[#1A447A] text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-[#2A5A96] transition-all duration-300 disabled:opacity-50 shadow-lg whitespace-nowrap"
            >
              {testLoading ? "Sending..." : "Send Test Email"}
            </button>
          </form>
          {testResult && (
            <p
              className={`mt-3 text-sm ${testResult.ok ? "text-emerald-400" : "text-rose-400"}`}
            >
              {testResult.msg}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
