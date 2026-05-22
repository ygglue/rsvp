"use client";

import { useState, useEffect } from "react";

export default function Background() {
  const [isLandscape, setIsLandscape] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsLandscape(w > h);
      setDims({ w, h });
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      className="bg-image"
      style={
        isLandscape
          ? {
              width: dims.h,
              height: dims.w,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(90deg)",
            }
          : undefined
      }
    />
  );
}
