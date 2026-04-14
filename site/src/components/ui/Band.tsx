const bandStyles = {
  exemplary:
    "text-band-green bg-[rgba(134,239,172,0.10)] border-[rgba(134,239,172,0.25)]",
  established:
    "text-band-cyan bg-[rgba(125,211,252,0.10)] border-[rgba(125,211,252,0.25)]",
  functional:
    "text-band-yellow bg-[rgba(252,211,77,0.10)] border-[rgba(252,211,77,0.25)]",
  developing:
    "text-band-orange bg-[rgba(251,146,60,0.10)] border-[rgba(251,146,60,0.25)]",
  critical:
    "text-band-red bg-[rgba(248,113,113,0.10)] border-[rgba(248,113,113,0.25)]",
} as const;

export type BandLevel = keyof typeof bandStyles;

export default function Band({ level }: { level: BandLevel }) {
  return (
    <span
      className={`inline-flex px-2.5 py-1.5 rounded-full text-[0.78rem] font-bold border capitalize ${bandStyles[level]}`}
    >
      {level}
    </span>
  );
}
