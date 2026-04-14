export default function Stat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[18px] p-4">
      <strong className="block text-[1.35rem] mb-1">{value}</strong>
      <span className="text-muted text-[0.92rem]">{label}</span>
    </div>
  );
}
