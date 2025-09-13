import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegalForm AI - Turn Legal Forms into Structured Data Instantly",
  description:
    "Transform handwritten criminal defence aid applications into searchable, editable data. Built for the Public Defender's Office to handle messy handwriting, informal responses, and incomplete fields.",
  keywords:
    "legal forms, OCR, handwriting recognition, public defender, criminal defence, AI extraction, legal tech",
  authors: [{ name: "LegalForm AI Team" }],
  openGraph: {
    title: "LegalForm AI - Legal Form Processing",
    description:
      "Transform handwritten legal forms into structured data instantly",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "#ffffff" }}
      >
        <Navbar />
        <main className="pt-20 bg-white min-h-screen">{children}</main>
      </body>
    </html>
  );
}
