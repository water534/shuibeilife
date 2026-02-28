import type { Metadata } from "next";
import "./globals.css";
import "./notion-overrides.css";
import { DevIndicatorLocalizer } from "@/components/DevIndicatorLocalizer";
import { ProgressBar } from "@/components/ProgressBar";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Vibe Coding",
  description: "极简风格内容站点",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-stone-50 text-stone-800">
        <ProgressBar />
        {children}
        <Navigation />
        <DevIndicatorLocalizer />
      </body>
    </html>
  );
}
