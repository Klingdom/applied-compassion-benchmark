import Link from "next/link";
import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "default" | "primary";
  full?: boolean;
  className?: string;
  external?: boolean;
};

export default function Button({
  children,
  href,
  variant = "default",
  full = false,
  className = "",
  external = false,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center min-h-[48px] px-[18px] rounded-[14px] font-bold transition-all duration-150";
  const variants = {
    default:
      "border border-line bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.06)] text-text",
    primary:
      "bg-gradient-to-br from-accent to-accent-2 text-[#07111f] border-transparent hover:from-[#8bddff] hover:to-[#6caefb]",
  };
  const cls = `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;

  if (href && external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return <button className={cls}>{children}</button>;
}
