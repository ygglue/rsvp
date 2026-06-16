export const eighteenRoses = [
  "Bonifacio Nate",
  "Rimson Bacuel",
  "Kim Darren Baaco",
  "Enguelbert Baaco",
  "Gems Andrei Bacuel",
  "Christian Jade Bacuel",
  "John Mar Collins Uy",
  "Robert Joaquin Puno",
  "Redd Andrey Castillo",
  "Caetan Logronio",
  "Claudio Favila",
  "Ramses Apostol",
  "Khurt Dave Palanca",
  "Grant Cyprian Ocampo",
  "Marc Daniel Campos",
  "James Asher Sabroso",
  "Eliyahu Lagumbay",
  "Eugenio Bacuel",
];

export const eighteenCandles = [
  "Margarita Uy",
  "Sarah Maguale",
  "Jeric Del Mundo",
  "Justinn Sabellano",
  "Glyza May Colonia",
  "Miel Antonette Cinco",
  "Ricka Jade Heredero",
  "Aliana Jewah Servando",
  "Thesa Monroid",
  "Shanna Otchia",
  "Aloha Telio",
  "Kee Libiran",
  "Azumi Gail Rapsing",
  "Michelle Angela Illustrisimo",
  "Khriz Claveria",
  "Jedidiah Minor",
  "Yasmin Puche",
  "Daniela Asther Tinasas",
];

export type SpecialRole = "rose" | "candle" | null;

function listContains(list: string[], rsvpName: string): boolean {
  const rsvpLower = rsvpName.toLowerCase();
  return list.some((listName) => {
    const words = listName.toLowerCase().split(/\s+/);
    if (words.length < 2) return rsvpLower.includes(words[0]);
    const first = words[0];
    const last = words[words.length - 1];
    return rsvpLower.includes(first) && rsvpLower.includes(last);
  });
}

export function getSpecialRole(name: string): SpecialRole {
  if (listContains(eighteenRoses, name)) return "rose";
  if (listContains(eighteenCandles, name)) return "candle";
  return null;
}

export function getSpecialRoleMessage(role: "rose" | "candle"): string {
  if (role === "rose") {
    return "You are one of my 18 Roses, and it would mean the world to me to have you stand beside me during this cherished part of my celebration.";
  }
  return "You are one of my 18 Candles, and your light has been a constant source of warmth and guidance in my life.";
}
