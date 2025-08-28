import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Only preload if heavily used
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://trakt.sayed.app"),
  title: "Sayed's Trakt Tracker",
  description:
    "Personal movie and TV show tracking dashboard with Trakt.tv integration",
  keywords: "movies, tv shows, trakt, watch tracker, sayed",
  authors: [{ name: "Sayed" }],
  robots: "index, follow",
  openGraph: {
    title: "Sayed's Trakt Tracker",
    description: "Personal movie and TV show tracking dashboard",
    type: "website",
    url: "https://trakt.sayed.app",
    siteName: "Sayed's Trakt Tracker",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Sayed's Trakt Tracker OG Image",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://wsrv.nl" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cfcdn.sayed.app" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
