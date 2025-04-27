// src/app/layout.tsx
import "./globals.css";
import { Providers } from "@/store/provider";
import type { Metadata } from "next";
import localFont from "next/font/local";

// Import Geist font
const geistSans = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: [
    {
      path: "./fonts/GeistMonoVF.woff",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "TARS Multi-Agent System",
  description: "AI Agent Workflow Visualization and Interaction System",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full overflow-hidden bg-[#f8fafc]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
