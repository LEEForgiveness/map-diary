import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Map Diary — 지도 위의 추억",
  description: "여행, 산책, 특별한 하루의 장면들을 사진으로 기록하고 지도에서 다시 꺼내보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
        style={{ background: "var(--color-cream)", color: "var(--color-deep-navy)" }}
      >
        {children}
      </body>
    </html>
  );
}
