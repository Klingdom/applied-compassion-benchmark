"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { mainNav, footerLinks } from "@/data/nav";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="sticky top-0 z-30 backdrop-blur-[12px] bg-[rgba(8,12,24,0.78)] border-b border-line">
      <div className="w-[min(1280px,calc(100%-32px))] mx-auto flex items-center justify-between gap-5 min-h-[74px]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[12px] bg-gradient-to-br from-accent to-accent-2 shadow-[0_10px_24px_rgba(96,165,250,0.28)] relative overflow-hidden">
            <span className="absolute w-[18px] h-[18px] bg-[rgba(7,17,31,0.9)] rounded-full left-[7px] top-[10px] -rotate-[16deg]" />
            <span className="absolute w-[18px] h-[18px] bg-[rgba(7,17,31,0.9)] rounded-full right-[7px] top-[10px] rotate-[16deg]" />
          </div>
          <span className="font-[750] tracking-[0.2px] text-base">
            Compassion Benchmark
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-4">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted hover:text-text transition-colors text-[0.96rem]"
            >
              {item.label}
            </Link>
          ))}

          {/* Tools dropdown */}
          <div ref={toolsRef} className="relative">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="text-muted hover:text-text transition-colors text-[0.96rem] flex items-center gap-1"
            >
              Tools
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-150 ${toolsOpen ? "rotate-180" : ""}`}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {toolsOpen && (
              <div className="absolute top-full right-0 mt-2 w-[260px] bg-panel border border-line rounded-[14px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
                {footerLinks.tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setToolsOpen(false)}
                    className="block px-4 py-3 text-[0.95rem] text-muted hover:text-text hover:bg-[rgba(255,255,255,0.05)] transition-colors border-b border-line last:border-b-0"
                  >
                    {tool.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/contact-sales"
            className="inline-flex items-center justify-center min-h-[42px] px-3.5 rounded-[12px] bg-gradient-to-br from-accent to-accent-2 text-[#07111f] font-bold border-0"
          >
            Contact Sales
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden text-muted p-2"
          aria-label="Toggle navigation"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-line px-4 pb-4">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2 text-muted hover:text-text transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="py-2 text-muted-subtle text-[0.82rem] font-semibold uppercase tracking-wider mt-1">
            Tools
          </div>
          {footerLinks.tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              onClick={() => setOpen(false)}
              className="block py-2 pl-2 text-muted hover:text-text transition-colors"
            >
              {tool.label}
            </Link>
          ))}
          <Link
            href="/contact-sales"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center min-h-[42px] px-3.5 rounded-[12px] bg-gradient-to-br from-accent to-accent-2 text-[#07111f] font-bold mt-2"
          >
            Contact Sales
          </Link>
        </div>
      )}
    </div>
  );
}
