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

export interface VisualConfig {
  hueRotate: number;
  brightness: number;
  saturate: number;
  leafColor: string;
}

export function originTranslate(origin: string) {
  const parts = origin.toLowerCase().split(/\\s+/);
  let tx = -50, ty = -50;
  if (parts.includes("left")) tx = 0;
  else if (parts.includes("right")) tx = -100;
  if (parts.includes("top")) ty = 0;
  else if (parts.includes("bottom")) ty = -100;
  return { tx, ty };
}

export const visualConfig: VisualConfig = {
  "hueRotate": 360,
  "brightness": 0.5,
  "saturate": 1,
  "leafColor": "#1A447A"
};

export const groups: GroupConfig[] = [
  {
    "anchorX": 100,
    "anchorY": 0,
    "flowers": [
      {
        "path": "/images/flower 1.webp",
        "origin": "bottom left",
        "offsetX": 313,
        "offsetY": -219,
        "rotation": 179.72497658008842,
        "scale": 165,
        "zIndex": 10
      },
      {
        "path": "/images/flower 2.webp",
        "origin": "top right",
        "offsetX": -944,
        "offsetY": 64,
        "rotation": 255.21985466016645,
        "scale": 120,
        "zIndex": 10
      },
      {
        "path": "/images/flower 3.webp",
        "origin": "bottom left",
        "offsetX": 531,
        "offsetY": -17,
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
        "offsetX": 90,
        "offsetY": -68,
        "rotation": 359.9625475487243,
        "scale": 125,
        "zIndex": 10
      },
      {
        "path": "/images/flower 2.webp",
        "origin": "bottom left",
        "offsetX": 235,
        "offsetY": -135,
        "rotation": 20.036059238319524,
        "scale": 125,
        "zIndex": 10
      },
      {
        "path": "/images/flower 3.webp",
        "origin": "bottom left",
        "offsetX": -148,
        "offsetY": -402,
        "rotation": 36.73098006588066,
        "scale": 120,
        "zIndex": 8
      }
    ]
  }
];
