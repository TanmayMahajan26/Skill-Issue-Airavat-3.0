import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "JusticeGrid — AI Legal Intelligence for India's Undertrial Crisis",
  description:
    "Real-time legal intelligence layer for NALSA panel lawyers, DLSA paralegals, and UTRC coordinators. Powered by AI to identify Section 479 BNSS eligible undertrials.",
  keywords: [
    "undertrial",
    "bail",
    "Section 479 BNSS",
    "NALSA",
    "legal aid",
    "India",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-jg-bg text-jg-text">
        {children}
      </body>
    </html>
  );
}
