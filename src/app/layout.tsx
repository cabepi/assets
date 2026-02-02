import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AssetTrack Pro",
  description: "Enterprise Asset Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
