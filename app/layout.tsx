import type { Metadata } from "next";
import localFont from "next/font/local";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import { TelegramScript } from "@/components/providers/TelegramScript";
import "./globals.css";

const nunito = localFont({
  src: [
    { path: "../public/fonts/Nunito-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Nunito-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Nunito-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-nunito",
  display: "swap",
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
        className={`${nunito.className} antialiased`}
        style={{ margin: 0, padding: 0 }}
      >
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}
