const HEX_BY_COLOR: Record<string, string> = {
  Red: "#dc2626",
  Green: "#16a34a",
  Blue: "#2563eb",
  Purple: "#9333ea",
  Black: "#18181b",
  Yellow: "#ca8a04",
};

export function ColorPip({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10"
      style={{ backgroundColor: HEX_BY_COLOR[color] ?? "#94a3b8" }}
      title={color}
      aria-label={color}
    />
  );
}
