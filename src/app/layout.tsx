import type { Metadata } from "next";
import { Source_Sans_3, Zilla_Slab } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const zillaSlab = Zilla_Slab({
  subsets: ["latin"],
  variable: "--font-zilla-slab",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FMS — Faculty Management System | Geeta University",
  description:
    "Internal Departmental Operations & Employee Performance Management Platform for Geeta University Branding Department.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${zillaSlab.variable}`}>
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased">{children}</body>
    </html>
  );
}
