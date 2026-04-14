import { ReactNode } from "react";

export default function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-gradient-to-b from-[rgba(255,255,255,0.045)] to-[rgba(255,255,255,0.02)] border border-line rounded-[22px] p-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.28)] ${className}`}
    >
      {children}
    </div>
  );
}
