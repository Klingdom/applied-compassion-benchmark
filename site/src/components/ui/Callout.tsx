import { ReactNode } from "react";

export default function Callout({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br from-[rgba(125,211,252,0.10)] to-[rgba(96,165,250,0.08)] border border-[rgba(125,211,252,0.18)] rounded-[24px] p-7 ${className}`}
    >
      {children}
    </div>
  );
}
