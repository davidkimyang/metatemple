import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "metatemple",
  description: "metatemple — an online temple with 7 shared halls, up to 100 visitors per hall, and 18 languages.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
