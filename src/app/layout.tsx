import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "頭囲 SDS",
  description: "日本人小児（0〜18 歳）の頭囲 SDS（6歳未満は2010年乳幼児身体発育調査を優先し Anzo 2002 を併記、6歳以上は Anzo 2002）を計算するツール。身長を入れると HCH-I も出す",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-slate-50 dark:bg-slate-900 font-[family-name:var(--font-geist-sans)]">
        {children}
      </body>
    </html>
  );
}
