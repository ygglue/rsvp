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
    <p className="text-[#FFD700] text-lg font-serif italic">
      {days} day{days !== 1 ? "s" : ""} until the celebration
    </p>
  );
}
