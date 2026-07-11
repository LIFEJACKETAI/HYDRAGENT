import Script from 'next/script';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HYDRAGENT - AI Appointment Agent",
  description: "Embeddable AI agent for appointment-based businesses. Manage bookings, emails, calls, and customer inquiries automatically.",
  keywords: ["HYDRAGENT", "AI agent", "appointments", "booking", "embeddable widget"],
  authors: [{ name: "LIFEJACKETAI" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <script src="https://cdn.hydragent.ai/widget.js" data-id="cmrbl5dgm0000uu9qbl9bwpvt"></script>
        <Toaster />
      </body>
    </html>
  );
}