import Link from "next/link";
import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  href?: string;
  variant?: "default" | "service" | "featured";
  className?: string;
};

const variants = {
  default:
    "bg-[rgba(255,255,255,0.03)] border border-line rounded-[20px] p-5 transition-all duration-150 h-full hover:-translate-y-px hover:bg-[rgba(255,255,255,0.04)]",
  service:
    "bg-gradient-to-b from-[rgba(255,255,255,0.045)] to-[rgba(255,255,255,0.02)] border border-line rounded-[22px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] flex flex-col gap-3.5 h-full",
  featured:
    "bg-gradient-to-b from-[rgba(125,211,252,0.08)] to-[rgba(255,255,255,0.03)] border border-[rgba(125,211,252,0.24)] rounded-[20px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition-all duration-150 h-full hover:-translate-y-px",
};

export default function Card({
  children,
  href,
  variant = "default",
  className = "",
}: CardProps) {
  const cls = `${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return <div className={cls}>{children}</div>;
}
