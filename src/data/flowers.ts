export const REF_W = 1920;
export const REF_H = 1080;

export interface FlowerConfig {
  path: string;
  origin: string;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scale: number;
  zIndex?: number;
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
    "anchorX": 100,
    "anchorY": 0,
    "flowers": [
      {
        "path": "/images/flower 1.webp",
        "origin": "bottom left",
        "offsetX": 100,
        "offsetY": -16,
        "rotation": 179.72497658008842,
        "scale": 165,
        "zIndex": 10
      },
      {
        "path": "/images/flower 2.webp",
        "origin": "top right",
        "offsetX": -865,
        "offsetY": -111,
        "rotation": 255.21985466016645,
        "scale": 160,
        "zIndex": 10
      },
      {
        "path": "/images/flower 3.webp",
        "origin": "bottom left",
        "offsetX": 295,
        "offsetY": 275,
        "rotation": 202.6485845640293,
        "scale": 135,
        "zIndex": 9
      }
    ]
  },
  {
    "anchorX": 0,
    "anchorY": 100,
    "flowers": [
      {
        "path": "/images/flower 1.webp",
        "origin": "bottom left",
        "offsetX": -12,
        "offsetY": 2,
        "rotation": 359.9625475487243,
        "scale": 125,
        "zIndex": 10
      },
      {
        "path": "/images/flower 2.webp",
        "origin": "bottom left",
        "offsetX": 115,
        "offsetY": 62,
        "rotation": 20.036059238319524,
        "scale": 125,
        "zIndex": 10
      },
      {
        "path": "/images/flower 3.webp",
        "origin": "bottom left",
        "offsetX": -212,
        "offsetY": -282,
        "rotation": 36.73098006588066,
        "scale": 120,
        "zIndex": 8
      }
    ]
  }
];
