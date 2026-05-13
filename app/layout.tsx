import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stellar - AI-ассистент для ЕГЭ/ОГЭ",
  description: "Персональный сократический учитель для подготовки к экзаменам",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Stellar",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stellar" />
        <meta name="theme-color" content="#f5f5f7" />
      </head>
      <body className="antialiased">
        <div className="background-blobs">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
