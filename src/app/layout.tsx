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
  title: "FMS — Faculty Management System",
  description:
    "Departmental Operations, Deliverable Tracking, and Performance Management Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${zillaSlab.variable}`}>
      <body className="min-h-screen bg-[#F7F8FC] text-[#202638] antialiased">
        {children}
      </body>
    </html>
  );
}
