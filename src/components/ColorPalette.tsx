const COLORS = [
  { hex: "#0A1E3F", label: "Dark Navy" },
  { hex: "#102F5C", label: "Navy Blue" },
  { hex: "#1A447A", label: "Royal Blue" },
  { hex: "#2A5A96", label: "Steel Blue" },
];

export default function ColorPalette() {
  return (
    <div className="flex gap-3 sm:gap-4">
      {COLORS.map((c) => (
        <div key={c.hex} className="group flex flex-col items-center gap-1.5">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white/10 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 group-hover:shadow-xl"
            style={{ backgroundColor: c.hex }}
          />
          <span className="text-[10px] text-[#8CB4E8] font-mono opacity-70 group-hover:opacity-100 transition-opacity">
            {c.hex}
          </span>
        </div>
      ))}
    </div>
  );
}
