import { ReactNode } from "react";

export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-[min(1280px,calc(100%-32px))] mx-auto ${className}`}>
      {children}
    </div>
  );
}
