import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Grimoire Architect — Blood on the Clocktower",
  description: "Storyteller script-building tool for Blood on the Clocktower"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
