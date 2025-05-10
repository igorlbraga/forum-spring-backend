import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; 
import { Providers } from "./providers"; 
import Navbar from "@/components/Navbar"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog App", 
  description: "A simple blog application using Next.js and Spring Boot", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="pt-16"> {/* Add padding-top to main content to avoid overlap with sticky navbar */}
            {children}
          </main>
          <Toaster richColors position="top-right" /> {/* Toaster can be inside or outside Providers based on needs */}
        </Providers>
      </body>
    </html>
  );
}
