import { ReactNode } from "react";

export default function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.08)] text-accent text-[0.86rem] mb-4">
      {children}
    </div>
  );
}
