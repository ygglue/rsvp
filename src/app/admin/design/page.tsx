"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { groups as initialGroups, originTranslate, REF_W } from "@/data/flowers";
import type { FlowerConfig, GroupConfig } from "@/data/flowers";
import { saveFlowersAction, checkAdminAuth } from "@/lib/actions";

const ORIGINS = ["center", "top left", "top right", "bottom left", "bottom right"];

export default function DesignEditor() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupConfig[]>(() =>
    initialGroups.map((g) => ({ ...g, flowers: g.flowers.map((f) => ({ ...f })) }))
  );
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [selectedFlower, setSelectedFlower] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [vwScale, setVwScale] = useState(1);

  const dragRef = useRef<{
    type: "group" | "flower";
    gIdx: number;
    fIdx: number;
    startX: number;
    startY: number;
    startAnchorX: number;
    startAnchorY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const resizeRef = useRef<{
    gIdx: number;
    fIdx: number;
    startX: number;
    startY: number;
    startScale: number;
  } | null>(null);

  const rotateRef = useRef<{
    gIdx: number;
    fIdx: number;
    startAngle: number;
    startRotation: number;
  } | null>(null);

  const flowerEls = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    checkAdminAuth().then((ok) => {
      if (!ok) router.push("/admin");
      else setAuthed(true);
    });
  }, [router]);

  useEffect(() => {
    const update = () => setVwScale(window.innerWidth / REF_W);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const patchFlower = useCallback(
    (gIdx: number, fIdx: number, patch: Partial<FlowerConfig>) => {
      setGroups((prev) => {
        const next = prev.map((g) => ({ ...g, flowers: g.flowers.map((f) => ({ ...f })) }));
        Object.assign(next[gIdx].flowers[fIdx], patch);
        return next;
      });
    },
    []
  );

  const patchGroup = useCallback(
    (gIdx: number, patch: Partial<Pick<GroupConfig, "anchorX" | "anchorY">>) => {
      setGroups((prev) => {
        const next = [...prev];
        next[gIdx] = { ...next[gIdx], ...patch };
        return next;
      });
    },
    []
  );

  useEffect(() => {
    if (!authed) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (resizeRef.current) {
        const r = resizeRef.current;
        const vwScale = window.innerWidth / REF_W;
        const dx = (e.clientX - r.startX) / vwScale;
        const dy = (e.clientY - r.startY) / vwScale;
        const delta = Math.round(Math.max(dx, dy) / 3);
        patchFlower(r.gIdx, r.fIdx, {
          scale: Math.max(10, Math.min(400, r.startScale + delta)),
        });
        return;
      }

      if (rotateRef.current) {
        const r = rotateRef.current;
        const key = `${r.gIdx}-${r.fIdx}`;
        const el = flowerEls.current.get(key);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
        patchFlower(r.gIdx, r.fIdx, {
          rotation: ((r.startRotation + (angle - r.startAngle)) % 360 + 360) % 360,
        });
        return;
      }

      if (dragRef.current) {
        const d = dragRef.current;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;

        if (d.type === "group") {
          const ax = ((d.startAnchorX * window.innerWidth / 100) + dx) / window.innerWidth * 100;
          const ay = ((d.startAnchorY * window.innerHeight / 100) + dy) / window.innerHeight * 100;
          patchGroup(d.gIdx, {
            anchorX: round1(ax),
            anchorY: round1(ay),
          });
        } else {
          const vwScale = window.innerWidth / REF_W;
          patchFlower(d.gIdx, d.fIdx, {
            offsetX: Math.round(d.startOffsetX + dx / vwScale),
            offsetY: Math.round(d.startOffsetY + dy / vwScale),
          });
        }
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      rotateRef.current = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      let gIdx = selectedGroup;
      let fIdx = selectedFlower;
      if (gIdx < 0 || gIdx >= groups.length) return;

      if (fIdx >= 0) {
        const f = groups[gIdx].flowers[fIdx];
        const step = e.shiftKey ? 10 : 2;
        let patch: Partial<FlowerConfig> | null = null;
        switch (e.key) {
          case "ArrowLeft":
            patch = { offsetX: f.offsetX - step }; break;
          case "ArrowRight":
            patch = { offsetX: f.offsetX + step }; break;
          case "ArrowUp":
            patch = { offsetY: f.offsetY - step }; break;
          case "ArrowDown":
            patch = { offsetY: f.offsetY + step }; break;
        }
        if (patch) { e.preventDefault(); patchFlower(gIdx, fIdx, patch); }
      } else {
        const g = groups[gIdx];
        const gStep = e.shiftKey ? 10 : 2;
        let ax = g.anchorX, ay = g.anchorY;
        switch (e.key) {
          case "ArrowLeft":
            ax -= gStep; break;
          case "ArrowRight":
            ax += gStep; break;
          case "ArrowUp":
            ay -= gStep; break;
          case "ArrowDown":
            ay += gStep; break;
          default:
            return;
        }
        e.preventDefault();
        patchGroup(gIdx, { anchorX: round1(ax), anchorY: round1(ay) });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [authed, selectedGroup, selectedFlower, groups, patchFlower, patchGroup]);

  const handleGroupDrag = (gIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedGroup(gIdx);
    setSelectedFlower(-1);
    dragRef.current = {
      type: "group",
      gIdx,
      fIdx: -1,
      startX: e.clientX,
      startY: e.clientY,
      startAnchorX: groups[gIdx].anchorX,
      startAnchorY: groups[gIdx].anchorY,
      startOffsetX: 0,
      startOffsetY: 0,
    };
  };

  const handleFlowerDrag = (gIdx: number, fIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedGroup(gIdx);
    setSelectedFlower(fIdx);
    dragRef.current = {
      type: "flower",
      gIdx,
      fIdx,
      startX: e.clientX,
      startY: e.clientY,
      startAnchorX: 0,
      startAnchorY: 0,
      startOffsetX: groups[gIdx].flowers[fIdx].offsetX,
      startOffsetY: groups[gIdx].flowers[fIdx].offsetY,
    };
  };

  const handleResizeStart = (gIdx: number, fIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedGroup(gIdx);
    setSelectedFlower(fIdx);
    resizeRef.current = {
      gIdx,
      fIdx,
      startX: e.clientX,
      startY: e.clientY,
      startScale: groups[gIdx].flowers[fIdx].scale,
    };
  };

  const handleRotateStart = (gIdx: number, fIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedGroup(gIdx);
    setSelectedFlower(fIdx);
    const key = `${gIdx}-${fIdx}`;
    const el = flowerEls.current.get(key);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rotateRef.current = {
      gIdx,
      fIdx,
      startAngle: Math.atan2(
        e.clientY - (rect.top + rect.height / 2),
        e.clientX - (rect.left + rect.width / 2)
      ) * (180 / Math.PI),
      startRotation: groups[gIdx].flowers[fIdx].rotation,
    };
  };

  const addGroup = () => {
    setGroups((prev) => [
      ...prev,
      {
        anchorX: 50,
        anchorY: 50,
        flowers: [
          {
            path: "/images/flower 1.png",
            origin: "center",
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            scale: 100,
            zIndex: 10,
          },
        ],
      },
    ]);
    setSelectedGroup(groups.length);
    setSelectedFlower(-1);
  };

  const deleteGroup = (gIdx: number) => {
    if (groups.length <= 1) return;
    setGroups((prev) => prev.filter((_, i) => i !== gIdx));
    if (selectedGroup >= gIdx && selectedGroup > 0) {
      setSelectedGroup(selectedGroup - 1);
    }
    setSelectedFlower(-1);
  };

  const addFlower = (gIdx: number) => {
    setGroups((prev) => {
      const next = prev.map((g) => ({ ...g, flowers: g.flowers.map((f) => ({ ...f })) }));
      next[gIdx].flowers.push({
        path: "/images/flower 1.png",
        origin: "center",
        offsetX: 0,
        offsetY: -120,
        rotation: 0,
        scale: 100,
        zIndex: 10,
      });
      return next;
    });
    setSelectedFlower(groups[gIdx].flowers.length);
  };

  const removeFlower = (gIdx: number, fIdx: number) => {
    setGroups((prev) => {
      const next = prev.map((g) => ({ ...g, flowers: g.flowers.map((f) => ({ ...f })) }));
      next[gIdx].flowers.splice(fIdx, 1);
      return next;
    });
    if (selectedFlower >= fIdx) {
      setSelectedFlower(Math.max(-1, selectedFlower - 1));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveFlowersAction(groups);
    if (result.success) alert("Design saved!");
    else alert("Error: " + result.error);
    setSaving(false);
  };

  const currentFlower =
    selectedGroup >= 0 &&
    selectedFlower >= 0 &&
    selectedFlower < groups[selectedGroup]?.flowers.length
      ? groups[selectedGroup].flowers[selectedFlower]
      : null;

  const currentGroup = groups[selectedGroup];

  if (!authed) return null;

  return (
    <main className="min-h-screen bg-slate-100 overflow-hidden select-none">
      {/* Canvas */}
      <div className="fixed inset-0">
        {groups.map((g, gi) => (
          <div key={gi}>
            {/* Group anchor handle */}
            <div
              className="fixed z-40 w-8 h-8 -translate-x-1/2 -translate-y-1/2 cursor-move"
              style={{ left: `${g.anchorX}%`, top: `${g.anchorY}%` }}
              onMouseDown={(e) => handleGroupDrag(gi, e)}
            >
              {gi === selectedGroup && (
                <div className="w-full h-full rounded-full bg-indigo-500/20 border-2 border-dashed border-indigo-400 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                </div>
              )}
            </div>

            {/* Group container — acts as a single scaled image */}
            <div
              className="fixed pointer-events-none"
              style={{
                left: `${g.anchorX}%`,
                top: `${g.anchorY}%`,
                width: 0,
                height: 0,
                transform: `translate(-50%, -50%) scale(${vwScale})`,
                transformOrigin: "center",
                zIndex: gi === selectedGroup ? 20 : 10,
              }}
            >
              {g.flowers.map((f, fi) => {
                const { tx, ty } = originTranslate(f.origin);
                const isFlowerSelected = gi === selectedGroup && fi === selectedFlower;
                const key = `${gi}-${fi}`;

                return (
                  <div
                    key={key}
                    ref={(el) => {
                      if (el) flowerEls.current.set(key, el);
                      else flowerEls.current.delete(key);
                    }}
                    className="absolute w-96 pointer-events-auto"
                    style={{
                      left: f.offsetX,
                      top: f.offsetY,
                      zIndex: isFlowerSelected ? f.zIndex + 1000 : f.zIndex,
                      transform: `translate(${tx}%, ${ty}%) rotate(${f.rotation}deg) scale(${f.scale / 100})`,
                      transformOrigin: f.origin,
                      cursor: isFlowerSelected ? "grabbing" : "grab",
                    }}
                    onMouseDown={(e) => handleFlowerDrag(gi, fi, e)}
                  >
                    <Image
                      src={f.path}
                      alt=""
                      width={400}
                      height={400}
                      draggable={false}
                      priority
                    />

                    {isFlowerSelected && (
                      <>
                        <div className="absolute inset-0 ring-2 ring-rose-400 ring-offset-2 rounded-lg pointer-events-none" />
                        {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                          <div
                            key={corner}
                            className="absolute w-4 h-4 bg-rose-500 border-2 border-white rounded-full shadow-md"
                            style={{
                              cursor: `${corner}-resize`,
                              [corner.includes("n") ? "top" : "bottom"]: -8,
                              [corner.includes("w") ? "left" : "right"]: -8,
                            }}
                            onMouseDown={(e) => handleResizeStart(gi, fi, e)}
                          />
                        ))}
                        <div
                          className="absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 bg-blue-500 border-2 border-white rounded-full shadow-md flex items-center justify-center cursor-crosshair"
                          onMouseDown={(e) => handleRotateStart(gi, fi, e)}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-200 p-5 max-h-[60vh] overflow-y-auto">
        {/* Group selector */}
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Group
          </label>
          <select
            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(Number(e.target.value));
              setSelectedFlower(-1);
            }}
          >
            {groups.map((g, i) => (
              <option key={i} value={i}>
                Group {i + 1} ({g.flowers.length} flowers)
              </option>
            ))}
          </select>
          <button
            onClick={addGroup}
            className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            + Group
          </button>
          {groups.length > 1 && (
            <button
              onClick={() => deleteGroup(selectedGroup)}
              className="px-2 py-1.5 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-500"
            >
              ×
            </button>
          )}
        </div>

        {/* Group anchor controls */}
        {currentGroup && selectedFlower < 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <div className="col-span-2">
              <span className="text-xs font-medium text-indigo-600">
                Group Anchor — drag the purple dot on canvas
              </span>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">
                Anchor X: {currentGroup.anchorX.toFixed(1)}%
              </label>
              <input
                type="range"
                min="-50"
                max="150"
                step="0.5"
                className="w-full h-1.5 accent-indigo-500"
                value={currentGroup.anchorX}
                onChange={(e) =>
                  patchGroup(selectedGroup, { anchorX: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-0.5">
                Anchor Y: {currentGroup.anchorY.toFixed(1)}%
              </label>
              <input
                type="range"
                min="-50"
                max="150"
                step="0.5"
                className="w-full h-1.5 accent-indigo-500"
                value={currentGroup.anchorY}
                onChange={(e) =>
                  patchGroup(selectedGroup, { anchorY: Number(e.target.value) })
                }
              />
            </div>
          </div>
        )}

        {/* Flower selector (inside group) */}
        {currentGroup && (
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Flower
            </label>
            <select
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white"
              value={selectedFlower >= 0 ? selectedFlower : ""}
              onChange={(e) => setSelectedFlower(Number(e.target.value))}
            >
              <option value="" disabled>
                — select a flower —
              </option>
              {currentGroup.flowers.map((f, i) => (
                <option key={i} value={i}>
                  {i + 1}. {f.path.split("/").pop()} ({f.origin})
                </option>
              ))}
            </select>
            <button
              onClick={() => addFlower(selectedGroup)}
              className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
            >
              + Flower
            </button>
          </div>
        )}

        {/* Flower controls */}
        {currentFlower && (
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">
                Flower {selectedFlower + 1} Controls
              </span>
              <button
                onClick={() => removeFlower(selectedGroup, selectedFlower)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">
                  Offset X: {currentFlower.offsetX}px
                </label>
                <input
                  type="range"
                  min="-1000"
                  max="1000"
                  step="1"
                  className="w-full h-1.5 accent-slate-800"
                  value={currentFlower.offsetX}
                  onChange={(e) =>
                    patchFlower(selectedGroup, selectedFlower, {
                      offsetX: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">
                  Offset Y: {currentFlower.offsetY}px
                </label>
                <input
                  type="range"
                  min="-1000"
                  max="1000"
                  step="1"
                  className="w-full h-1.5 accent-slate-800"
                  value={currentFlower.offsetY}
                  onChange={(e) =>
                    patchFlower(selectedGroup, selectedFlower, {
                      offsetY: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">
                  Rotation: {Math.round(currentFlower.rotation)}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  className="w-full h-1.5 accent-slate-800"
                  value={currentFlower.rotation}
                  onChange={(e) =>
                    patchFlower(selectedGroup, selectedFlower, {
                      rotation: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">
                  Scale: {currentFlower.scale}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="400"
                  step="5"
                  className="w-full h-1.5 accent-slate-800"
                  value={currentFlower.scale}
                  onChange={(e) =>
                    patchFlower(selectedGroup, selectedFlower, {
                      scale: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">
                  Z-Index: {currentFlower.zIndex}
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  className="w-full h-1.5 accent-slate-800"
                  value={currentFlower.zIndex}
                  onChange={(e) =>
                    patchFlower(selectedGroup, selectedFlower, {
                      zIndex: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Origin
              </label>
              <select
                className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                value={currentFlower.origin}
                onChange={(e) =>
                  patchFlower(selectedGroup, selectedFlower, {
                    origin: e.target.value,
                  })
                }
              >
                {ORIGINS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-slate-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Design"}
          </button>
          <button
            onClick={() => {
              setGroups(
                initialGroups.map((g) => ({
                  ...g,
                  flowers: g.flowers.map((f) => ({ ...f })),
                }))
              );
              setSelectedGroup(0);
              setSelectedFlower(-1);
            }}
            className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Reset
          </button>
        </div>

        <p className="text-[10px] text-slate-400 mt-3 text-center">
          Drag the purple dot to move a group · Click a flower to select it · Drag for pixel-perfect placement ·
          Corner handles resize · Blue dot rotates · Arrow keys nudge (Shift for bigger steps)
        </p>
      </div>
    </main>
  );
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
