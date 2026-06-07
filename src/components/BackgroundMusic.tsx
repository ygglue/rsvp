"use client";

import { useRef, useState, useEffect, useCallback } from "react";

type AudioState = "loading" | "ready" | "playing" | "muted" | "error";

const musicNotePath = "M9 18V5l12-2v13";
const playTrianglePath = "M8 5v14l11-7z";

const TARGET_VOLUME = 0.4;
const FADE_IN_DURATION = 1000;
const CROSSFADE_DURATION = 1500;
const MUTE_FADE_DURATION = 300;
const LOOP_FADE_THRESHOLD = 1.5;

function cancelRaf(rafRef: { current: number | null }) {
  if (rafRef.current !== null) {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }
}

function fadeVolume(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  duration: number,
  rafRef: { current: number | null },
  onComplete?: () => void,
) {
  cancelRaf(rafRef);

  const start = performance.now();

  function step(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 2);
    audio.volume = from + (to - from) * eased;

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      rafRef.current = null;
      onComplete?.();
    }
  }

  rafRef.current = requestAnimationFrame(step);
}

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const isFadingRef = useRef(false);
  const userMutedRef = useRef(false);
  const [state, setState] = useState<AudioState>("loading");

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    const handleCanPlay = () => {
      setState("ready");
    };

    const handleTimeUpdate = () => {
      if (isFadingRef.current) return;
      if (!audio.duration || audio.duration <= LOOP_FADE_THRESHOLD * 2) return;

      const remaining = audio.duration - audio.currentTime;
      if (remaining <= LOOP_FADE_THRESHOLD) {
        isFadingRef.current = true;
        const targetVol = userMutedRef.current ? 0 : TARGET_VOLUME;

        fadeVolume(
          audio,
          audio.volume,
          0,
          CROSSFADE_DURATION,
          fadeRafRef,
          () => {
            audio.currentTime = 0;
            audio.play();
            fadeVolume(
              audio,
              0,
              targetVol,
              CROSSFADE_DURATION,
              fadeRafRef,
              () => {
                isFadingRef.current = false;
              },
            );
          },
        );
      }
    };

    const handleEnded = () => {
      if (isFadingRef.current) {
        audio.currentTime = 0;
        audio.play();
        isFadingRef.current = false;
      }
    };

    const handleError = () => setState("error");

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audio.src = "/music/bg.m4a";

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      cancelRaf(fadeRafRef);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const handleClick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state === "ready") {
      audio
        .play()
        .then(() => {
          setState("playing");
          fadeVolume(audio, 0, TARGET_VOLUME, FADE_IN_DURATION, fadeRafRef);
        })
        .catch(() => setState("error"));
    } else if (state === "playing") {
      userMutedRef.current = true;
      isFadingRef.current = false;
      fadeVolume(
        audio,
        audio.volume,
        0,
        MUTE_FADE_DURATION,
        fadeRafRef,
        () => {
          audio.muted = true;
          setState("muted");
        },
      );
    } else if (state === "muted") {
      audio.muted = false;
      userMutedRef.current = false;
      isFadingRef.current = false;
      setState("playing");
      fadeVolume(audio, 0, TARGET_VOLUME, MUTE_FADE_DURATION, fadeRafRef);
    }
  }, [state]);

  if (state === "error") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-1.5">
      {state === "ready" && (
        <div className="relative bg-[#102F5C]/90 backdrop-blur-sm border border-[#1A447A]/50 rounded-lg px-2.5 py-1">
          <span className="text-[#FFD700]/80 text-[10px] italic tracking-wide animate-pulse whitespace-nowrap">
            tap to play
          </span>
          <div className="absolute right-2.5 -bottom-[5px] w-[10px] h-[10px] rotate-45 bg-[#102F5C]/90 border-b border-r border-[#1A447A]/50" />
        </div>
      )}
      <button
        onClick={handleClick}
        aria-label={
          state === "ready"
            ? "Play background music"
            : state === "muted"
              ? "Unmute background music"
              : "Mute background music"
        }
        className={[
          "w-9 h-9 rounded-full",
          "bg-[#0A1E3F]/80 backdrop-blur-sm",
          "border hover:border-[#FFD700]/70",
          "flex items-center justify-center shrink-0",
          "transition-all duration-300",
          "hover:scale-110 hover:shadow-lg hover:shadow-[#FFD700]/10",
          "focus:outline-none",
          state === "loading"
            ? "border-[#FFD700]/50 music-loading"
            : state === "ready"
              ? "border-[#FFD700]/40"
              : state === "muted"
                ? "border-[#1A447A]/50"
                : "border-[#FFD700]/30",
        ].join(" ")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={state === "muted" ? "#5A7AAC" : "#FFD700"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {state === "loading" ? (
            <>
              <path d={musicNotePath} />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </>
          ) : state === "ready" ? (
            <path d={playTrianglePath} fill="#FFD700" stroke="none" />
          ) : state === "muted" ? (
            <>
              <path d={musicNotePath} />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
              <line x1="1" y1="1" x2="23" y2="23" stroke="#FFD700" strokeWidth="2" />
            </>
          ) : (
            <>
              <path d={musicNotePath} />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
