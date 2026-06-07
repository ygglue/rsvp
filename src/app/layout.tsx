import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import local from "next/font/local";
import Background from "./background";
import BackgroundMusic from "@/components/BackgroundMusic";
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
  title: "Anne's 18th Birthday · RSVP",
  description: "RSVP for Anne's 18th Birthday celebration on July 6, 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Background />
        <FallingLeaves />
        <BackgroundMusic />
        {children}
      </body>
    </html>
  );
}
