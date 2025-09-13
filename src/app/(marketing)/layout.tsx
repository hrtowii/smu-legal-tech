import Link from "next/link";
import localFont from "next/font/local"

const sfFont = localFont({
  src: "../../../public/fonts/SF-Pro.ttf", 
  variable: "--font-SF",
});

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <main>{children}</main>
    </div>
  );
}
