import Link from "next/link";
import { footerLinks } from "@/data/nav";

export default function Footer() {
  return (
    <footer className="mt-[34px] pt-[38px] pb-[50px] border-t border-line text-muted">
      <div className="w-[min(1280px,calc(100%-32px))] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px]">
        <div className="bg-gradient-to-b from-[rgba(255,255,255,0.045)] to-[rgba(255,255,255,0.02)] border border-line rounded-[22px] p-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
          <h3 className="text-text text-[1.08rem] font-bold mb-2.5">
            Compassion Benchmark
          </h3>
          <p className="text-muted mb-3">
            Independent benchmark research across governments, public systems,
            corporations, AI labs, and robotics institutions.
          </p>
          <p className="text-muted">
            Public index publication is independent. Paid services support
            access, analysis, review, and institutional use.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <h4 className="text-text text-[0.95rem] font-bold mb-2.5">
              Indexes
            </h4>
            {footerLinks.indexes.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-muted hover:text-text mb-2 text-[0.94rem]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="text-text text-[0.95rem] font-bold mb-2.5">
              Research
            </h4>
            {footerLinks.research.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-muted hover:text-text mb-2 text-[0.94rem]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="text-text text-[0.95rem] font-bold mb-2.5">
              Services
            </h4>
            {footerLinks.services.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-muted hover:text-text mb-2 text-[0.94rem]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 className="text-text text-[0.95rem] font-bold mb-2.5">
              Tools
            </h4>
            {footerLinks.tools.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-muted hover:text-text mb-2 text-[0.94rem]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[min(1280px,calc(100%-32px))] mx-auto mt-[18px]">
        &copy; {new Date().getFullYear()} Compassion Benchmark
      </div>
    </footer>
  );
}
