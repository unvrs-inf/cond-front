import type { Metadata } from "next";
import localFont from "next/font/local";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import { TelegramScript } from "@/components/providers/TelegramScript";
import "./globals.css";

const openSans = localFont({
  src: [
    { path: "../public/fonts/OpenSans-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/OpenSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/OpenSans-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-open-sans",
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
        className={`${openSans.variable} antialiased`}
        style={{ margin: 0, padding: 0 }}
      >
        <TelegramProvider>
          {children}
        </TelegramProvider>
      </body>
    </html>
  );
}
