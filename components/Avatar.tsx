const AVATAR_COLORS = [
  "#35482a", // primary green
  "#4c6b3a", // brighter green
  "#c09d5f", // gold
  "#3b6ea5", // info blue
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function Avatar({
  name,
  size = "md",
}: {
  name: string | null | undefined;
  size?: "sm" | "md";
}) {
  const trimmed = name?.trim();
  const isAnonymous = !trimmed;
  const initial = (trimmed || "A").charAt(0).toUpperCase();
  const color = isAnonymous
    ? "#6b7263"
    : AVATAR_COLORS[hashString(trimmed!) % AVATAR_COLORS.length];
  const sizeClasses = size === "sm" ? "h-6 w-6 text-xs" : "h-9 w-9 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-medium text-white ${sizeClasses}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
