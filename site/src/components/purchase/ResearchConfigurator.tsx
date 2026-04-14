"use client";

import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";

const areaMap: Record<string, string> = {
  countries: "World Countries Index",
  states: "U.S. States Index",
  fortune500: "Fortune 500 Index",
  ailabs: "AI Labs Index",
  robotics: "Humanoid Robotics Labs Index",
  all: "All Indexes Bundle",
};

const formatMap: Record<string, string> = {
  pdf: "PDF Report",
  pdfappendix: "PDF + Data Appendix",
  deck: "PDF + Slide Deck",
  institutional: "Institutional Research Pack",
};

const licenseMap: Record<string, string> = {
  individual: "Individual License",
  team: "Team / Internal Use License",
  enterprise: "Enterprise License",
  academic: "Academic / Research License",
};

const descriptionMap: Record<string, string> = {
  pdf: "Professionally formatted benchmark report for standard review and internal reading.",
  pdfappendix:
    "Benchmark report with structured appendix tables and expanded benchmark detail.",
  deck: "Benchmark report paired with presentation-ready materials for executive use.",
  institutional:
    "Expanded package for institutional teams requiring broader internal access and delivery.",
};

export default function ResearchConfigurator() {
  const [year, setYear] = useState("2026");
  const [area, setArea] = useState("countries");
  const [format, setFormat] = useState("pdf");
  const [license, setLicense] = useState("individual");

  const summary = useMemo(() => {
    const yearLabel = year === "multi" ? "Multi-year" : year;
    return {
      title: `${yearLabel} ${areaMap[area]} — ${formatMap[format]} — ${licenseMap[license]}`,
      description: descriptionMap[format],
      href: `/contact-sales?year=${encodeURIComponent(year)}&area=${encodeURIComponent(area)}&format=${encodeURIComponent(format)}&license=${encodeURIComponent(license)}`,
    };
  }, [year, area, format, license]);

  const selectClass =
    "min-h-[48px] rounded-[14px] border border-line bg-panel-2 text-text px-3.5 w-full text-base";

  return (
    <div className="bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.02)] border border-line rounded-[24px] p-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        <div className="flex flex-col gap-2">
          <label className="text-muted text-[0.9rem]">Year</label>
          <select
            className={selectClass}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="multi">Multi-year bundle</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-muted text-[0.9rem]">Target area</label>
          <select
            className={selectClass}
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            {Object.entries(areaMap).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-muted text-[0.9rem]">Format</label>
          <select
            className={selectClass}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {Object.entries(formatMap).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-muted text-[0.9rem]">License</label>
          <select
            className={selectClass}
            value={license}
            onChange={(e) => setLicense(e.target.value)}
          >
            {Object.entries(licenseMap).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-[18px] p-[18px] border border-line rounded-[18px] bg-[rgba(255,255,255,0.03)]">
        <div className="text-base font-bold mb-1.5">{summary.title}</div>
        <div className="text-muted mb-3">{summary.description}</div>
        <div className="flex gap-3 flex-wrap">
          <Button href={summary.href} variant="primary">
            Continue to purchase inquiry
          </Button>
          <Button href="/contact-sales">Request custom quote</Button>
        </div>
      </div>
    </div>
  );
}
