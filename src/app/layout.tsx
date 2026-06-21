// app/layout.tsx

import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import HomeNav from "@/components/homeNav";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShopHub",
  description: "Modern E-commerce Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <body className={inter.className} suppressHydrationWarning>
        <HomeNav />
        {children}
      </body>
    </html>
  );
}
