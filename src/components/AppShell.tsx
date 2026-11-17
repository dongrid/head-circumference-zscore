"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

interface AppShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
}

export default function AppShell({
  title,
  subtitle,
  children,
  maxWidth = "4xl",
}: AppShellProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="テーマ切り替え"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className={`flex-1 max-w-${maxWidth} mx-auto w-full px-3 sm:px-6 py-6 sm:py-8 overflow-x-hidden`}>
        {children}
      </main>

      <footer className="px-6 py-6 text-center text-xs text-slate-400 dark:text-slate-600 space-y-1.5">
        <p>本ツールは診療支援目的です。最終判断は必ず医師が行ってください。</p>
        <p className="leading-relaxed">
          頭囲：Anzo M, Takahashi T, Sato S, Matsuo N. The cross-sectional head circumference growth curves for
          Japanese from birth to 18 years of age: the 1990 and 1992–1994 national survey data.{" "}
          <em>Ann Hum Biol.</em> 2002;29(4):373–88. DOI:{" "}
          <a href="https://doi.org/10.1080/03014460110089526" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-500 dark:hover:text-slate-400 transition-colors">10.1080/03014460110089526</a>
          （Table 1 の LMS、6.0〜7.0 歳は線形補間）
        </p>
        <p className="leading-relaxed">身長：日本小児内分泌学会・日本成長学会合同標準値委員会 2000年 日本人小児の体格標準値（月齢ごとの平均・SD）</p>
        <p className="leading-relaxed">
          HCH-I：Cheung MS, et al. <em>Am J Med Genet A.</em> 2026;200:353–359. 判定基準：Dauber A, et al. <em>Nat Rev Endocrinol.</em> 2026.
        </p>
      </footer>
    </div>
  );
}
