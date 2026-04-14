import { ReactNode } from "react";

export default function Pill({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex px-2.5 py-1.5 rounded-full text-[0.78rem] font-bold border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.08)] text-accent whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}
