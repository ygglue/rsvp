import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Background from "./background";
import FallingLeaves from "./falling-leaves";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RSVP",
  description: "Event RSVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Background />
        <FallingLeaves />
        {children}
      </body>
    </html>
  );
}
