import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import { TelegramScript } from "@/components/providers/TelegramScript";
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
  title: "Кондиционеры",
  description: "Сервис по обслуживанию кондиционеров",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <TelegramScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0 }}
      >
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}
