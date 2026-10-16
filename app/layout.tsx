import type { Metadata, Viewport } from "next";
import { profile } from "@/lib/portfolio";
import "@fontsource-variable/dm-sans";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: `${profile.name} — Developer & Project Manager`,
  description:
    "A portfolio about building thoughtful digital products and bringing ambitious projects to life. Preview edition with sample projects.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f4f0",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
