"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import HcChart from "@/components/HcChart";
import { getLMS, calcZScore, heightSds, AGE_MIN, AGE_MAX, type Sex } from "@/lib/hc";

function hcInterpret(z: number): string {
  if (z > 2.0) return "大頭（+2 SD 超）";
  if (z > 1.0) return "やや大きい（+1〜+2 SD）";
  if (z >= -1.0) return "正常範囲（±1 SD 以内）";
  if (z >= -2.0) return "やや小さい（−2〜−1 SD）";
  return "小頭（−2 SD 未満）";
}

function zColor(z: number): string {
  const a = Math.abs(z);
  if (a > 2.0) return "text-orange-500 dark:text-orange-400";
  if (a > 1.0) return "text-amber-500 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

const sign = (z: number) => `${z >= 0 ? "+" : ""}${z.toFixed(2)}`;

const inputCls =
  "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function parsePositive(s: string): number | null {
  if (s === "") return null;
  const n = parseFloat(s);
  return !isNaN(n) && n > 0 ? n : null;
}

const toggleCls = (on: boolean) =>
  `flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
    on
      ? "bg-blue-600 text-white"
      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
  }`;

export default function Home() {
  const [sex, setSex] = useState<Sex>("male");
  const [ageMode, setAgeMode] = useState<"simple" | "exact">("simple");
  const [ageYear, setAgeYear] = useState<number>(8);
  const [ageMonth, setAgeMonth] = useState<number>(0);
  const [birthDate, setBirthDate] = useState<string>("");
  const [measureDate, setMeasureDate] = useState<string>(() =>
    new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" })
  );
  const [hcInput, setHcInput] = useState<string>("");
  const [heightInput, setHeightInput] = useState<string>("");

  const age = useMemo((): number | null => {
    if (ageMode === "exact") {
      if (!birthDate) return null;
      const ms = new Date(measureDate).getTime() - new Date(birthDate).getTime();
      return Math.max(0, ms / (1000 * 60 * 60 * 24 * 365.25));
    }
    return ageYear + ageMonth / 12;
  }, [ageMode, ageYear, ageMonth, birthDate, measureDate]);

  const outOfRange = age !== null && (age < AGE_MIN || age > AGE_MAX);

  const hc = useMemo(() => {
    const x = parsePositive(hcInput);
    if (x === null || age === null || outOfRange) return { x, z: null, M: null, L: null, S: null };
    const { L, M, S } = getLMS(sex, age);
    return { x, z: calcZScore(x, L, M, S), M, L, S };
  }, [hcInput, age, outOfRange, sex]);

  const ht = useMemo(() => {
    const h = parsePositive(heightInput);
    if (h === null || age === null || outOfRange) return null;
    return heightSds(sex, age, h);
  }, [heightInput, age, outOfRange, sex]);

  const hchi = hc.z !== null && ht !== null ? ht.z - hc.z / 2 : null;

  return (
    <AppShell title="頭囲 SDS・HCH-I" subtitle="0〜18 歳 · 日本人小児 · 頭囲 0〜6歳 2010年調査（学会の曲線）／7歳以降 Anzo 2002 · 身長 学会 2000年基準" maxWidth="6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">性別</p>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setSex("male")} className={toggleCls(sex === "male")}>男子</button>
              <button onClick={() => setSex("female")} className={toggleCls(sex === "female")}>女子</button>
            </div>

            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">年齢</p>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setAgeMode("simple")} className={toggleCls(ageMode === "simple")}>年齢で入力</button>
              <button onClick={() => setAgeMode("exact")} className={toggleCls(ageMode === "exact")}>生年月日から計算</button>
            </div>

            {ageMode === "simple" ? (
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <select value={ageYear} onChange={(e) => setAgeYear(Number(e.target.value))} className={inputCls}>
                      {Array.from({ length: 19 }, (_, y) => y).map((y) => (
                        <option key={y} value={y}>{y} 歳</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-0">
                    <select value={ageMonth} onChange={(e) => setAgeMonth(Number(e.target.value))} className={inputCls}>
                      {Array.from({ length: 12 }, (_, m) => m).map((m) => (
                        <option key={m} value={m}>{m} か月</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
                  {ageYear} 歳 {ageMonth} か月（{(ageYear + ageMonth / 12).toFixed(2)} 歳）
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div>
                  <label className="text-xs text-slate-400 dark:text-slate-500 mb-1 block">生年月日</label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 dark:text-slate-500 mb-1 block">測定日</label>
                  <input type="date" value={measureDate} onChange={(e) => setMeasureDate(e.target.value)} className={inputCls} />
                </div>
                {age === null && <p className="text-xs text-amber-500">生年月日を入力してください</p>}
                {age !== null && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-right">
                    {Math.floor(age)} 歳 {Math.floor((age - Math.floor(age)) * 12)} か月（{age.toFixed(2)} 歳）
                  </p>
                )}
              </div>
            )}
            {outOfRange && (
              <p className="mt-2 text-xs text-red-500 font-medium">対象年齢範囲外です（0〜18 歳のみ）</p>
            )}

            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-4 mb-3">測定値</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-400 dark:text-slate-500 mb-1 block">頭囲 (cm)</label>
                <input type="number" inputMode="decimal" value={hcInput} onChange={(e) => setHcInput(e.target.value)} placeholder="52.0" step={0.1} min={0} className={inputCls} />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">眉弓の上と後頭部の最突出部を通る周</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 dark:text-slate-500 mb-1 block">身長 (cm)（HCH-I を出すとき）</label>
                <input type="number" inputMode="decimal" value={heightInput} onChange={(e) => setHeightInput(e.target.value)} placeholder="125.0" step={0.1} min={0} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
              頭囲曲線（{sex === "male" ? "男子" : "女子"}）
            </p>

            {(hc.z !== null || ht !== null) && (
              <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400">頭囲 SDS</p>
                  {hc.z !== null ? (
                    <>
                      <p className={`text-2xl font-bold tabular-nums ${zColor(hc.z)}`}>{sign(hc.z)}</p>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{hcInterpret(hc.z)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">M = {hc.M!.toFixed(1)} cm</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">—</p>
                  )}
                </div>
                <div className="rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400">身長 SDS{ht?.capped ? "（参考：17歳11か月の基準）" : ""}</p>
                  {ht !== null ? (
                    <>
                      <p className={`text-2xl font-bold tabular-nums ${zColor(ht.z)}`}>{sign(ht.z)}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">平均 {ht.mean.toFixed(1)} / SD {ht.sd.toFixed(2)} cm</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">—</p>
                  )}
                </div>
                <div className={`rounded-xl px-4 py-3 ${
                  hchi !== null && hchi < -2 ? "bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800" : "bg-slate-50 dark:bg-slate-900"
                }`}>
                  <p className="text-xs text-slate-500 dark:text-slate-400">HCH-I</p>
                  {hchi !== null ? (
                    <>
                      <p className={`text-2xl font-bold tabular-nums ${hchi < -2 ? "text-orange-500 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}>{sign(hchi)}</p>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {hchi < -2 ? "相対的大頭（−2 未満）" : "相対的大頭なし（−2 以上）"}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400">頭囲と身長を入力</p>
                  )}
                </div>
              </div>
            )}

            <HcChart sex={sex} ageYears={age} value={hc.x} zScore={hc.z} />

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-orange-500 dark:text-orange-400">HCH-I</span>
                ＝身長SDS − 頭囲SDS/2。−2 未満で、ほかに原因がなければ相対的大頭（軟骨低形成症の国際基準の大基準、Dauber 2026）。頭囲 +2 SD 超は絶対的大頭（小基準）。
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                頭囲の基準は、0〜6 歳が学会の頭囲曲線と同じ2010年乳幼児身体発育調査、7 歳以降が Anzo 2002（1992〜94年調査）。6〜7 歳は両者の間をつないでいる。
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
