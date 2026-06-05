"use client";

import { useEffect, useRef } from "react";
import { visualConfig } from "@/data/flowers";

interface Leaf {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  fallSpeed: number;
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  opacity: number;
  age: number;
}

const MAX_LEAVES = 40;
const SPAWN_INTERVAL = 400;

function drawLeaf(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(s * 0.4, -s * 0.4, s * 0.8, -s * 0.2, s, 0);
  ctx.bezierCurveTo(s * 0.8, s * 0.2, s * 0.4, s * 0.4, 0, 0);
  ctx.fill();
}

export default function FallingLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const leafColor = visualConfig.leafColor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio, 2);

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    const leaves: Leaf[] = [];
    let lastSpawn = performance.now();
    let raf = 0;

    function spawn() {
      if (leaves.length >= MAX_LEAVES) return;
      leaves.push({
        x: Math.random() * w,
        y: -20,
        size: 10 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        fallSpeed: 0.8 + Math.random() * 1.2,
        swayAmp: 20 + Math.random() * 30,
        swayFreq: 0.01 + Math.random() * 0.02,
        swayPhase: Math.random() * Math.PI * 2,
        opacity: 0.3 + Math.random() * 0.4,
        age: 0,
      });
    }

    function loop(now: number) {
      if (now - lastSpawn > SPAWN_INTERVAL) {
        spawn();
        lastSpawn = now;
      }

      for (let i = leaves.length - 1; i >= 0; i--) {
        const l = leaves[i];
        l.age++;
        l.y += l.fallSpeed;
        l.x += Math.sin(l.age * l.swayFreq + l.swayPhase) * 0.5;
        l.rotation += l.rotationSpeed;
        if (l.y > h + 40) {
          leaves.splice(i, 1);
        }
      }

      ctx!.clearRect(0, 0, w, h);

      for (const l of leaves) {
        ctx!.save();
        ctx!.translate(l.x, l.y);
        ctx!.rotate(l.rotation);
        ctx!.globalAlpha = l.opacity;
        ctx!.fillStyle = leafColor;
        drawLeaf(ctx!, l.size);
        ctx!.restore();
      }

      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [leafColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}
