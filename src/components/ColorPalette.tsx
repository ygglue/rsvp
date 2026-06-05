const COLORS = [
  { hex: "#0A1E3F", label: "Dark Navy" },
  { hex: "#102F5C", label: "Navy Blue" },
  { hex: "#1A447A", label: "Royal Blue" },
  { hex: "#2A5A96", label: "Steel Blue" },
];

export default function ColorPalette() {
  return (
    <div className="flex gap-3 justify-center">
      {COLORS.map((c) => (
        <div key={c.hex} className="flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded-full border-2 border-white/20 shadow-lg"
            style={{ backgroundColor: c.hex }}
          />
          <span className="text-[10px] text-blue-200 font-mono">{c.hex}</span>
        </div>
      ))}
    </div>
  );
}
