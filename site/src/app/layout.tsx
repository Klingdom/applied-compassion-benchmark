import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Compassion Benchmark | Global Benchmarking for Institutional Compassion",
    template: "%s | Compassion Benchmark",
  },
  description:
    "Compassion Benchmark publishes comparative benchmark research across countries, U.S. states, Fortune 500 companies, AI labs, and humanoid robotics labs using a structured institutional compassion framework.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
