export default function SectionHead({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex justify-between items-end gap-[18px] mb-[18px]">
      <div>
        <h2 className="text-[clamp(1.55rem,3vw,2.15rem)] tracking-tight mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-muted max-w-[900px]">{description}</p>
        )}
      </div>
    </div>
  );
}
