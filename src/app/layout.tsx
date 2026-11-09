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
  title: "Mega Rifa | Panetone laCreme",
  description: "Concorra ao Panetone Trufado laCreme Premium ao Leite. Sorteio em 01/12/2026.",
  openGraph: {
    title: "Mega Rifa | Panetone Trufado laCreme",
    description: "Concorra a essa delícia. Sorteio em 01/12/2026.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
