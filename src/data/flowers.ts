export const REF_W = 1920;
export const REF_H = 1080;

export interface FlowerConfig {
  path: string;
  origin: string;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface GroupConfig {
  anchorX: number;
  anchorY: number;
  flowers: FlowerConfig[];
}

export function originTranslate(origin: string) {
  const parts = origin.toLowerCase().split(/\s+/);
  let tx = -50, ty = -50;
  if (parts.includes("left")) tx = 0;
  else if (parts.includes("right")) tx = -100;
  if (parts.includes("top")) ty = 0;
  else if (parts.includes("bottom")) ty = -100;
  return { tx, ty };
}

export const groups: GroupConfig[] = [
  {
    anchorX: 100,
    anchorY: 0,
    flowers: [
      {
        path: "/images/flower 1.png",
        origin: "center",
        offsetX: -177,
        offsetY: 142,
        rotation: 180,
        scale: 100,
        zIndex: 10,
      },
      {
        path: "/images/flower 2.png",
        origin: "top right",
        offsetX: -584,
        offsetY: -88,
        rotation: 262,
        scale: 100,
        zIndex: 20,
      },
      {
        path: "/images/flower 3.png",
        origin: "top right",
        offsetX: -275,
        offsetY: 308,
        rotation: 212,
        scale: 73,
        zIndex: 30,
      },
    ],
  },
  {
    anchorX: 0,
    anchorY: 100,
    flowers: [
      {
        path: "/images/flower 1.png",
        origin: "bottom left",
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        scale: 100,
        zIndex: 10,
      },
      {
        path: "/images/flower 2.png",
        origin: "bottom left",
        offsetX: 115,
        offsetY: 62,
        rotation: 20,
        scale: 100,
        zIndex: 20,
      },
      {
        path: "/images/flower 3.png",
        origin: "bottom left",
        offsetX: -131,
        offsetY: -238,
        rotation: 52,
        scale: 70,
        zIndex: 30,
      },
    ],
  },
];
