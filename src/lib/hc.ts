// 頭囲 SDS と身長 SDS（学会 2000年基準）、HCH-I。
// 頭囲の基準：0〜6歳は学会の頭囲曲線と同じ 2010年調査（katoFormula.ts）、7歳以降は Anzo 2002 Table 1。
// 6〜7歳は、6歳の 2010年値と Anzo の 7.0歳（6.75〜7.24歳群）の値の間を線形補間する。
//
// LMS: z = [(X/M)^L − 1] / (L·S)   (L ≠ 0),  z = ln(X/M)/S   (L = 0)
// HCH-I = 身長SDS − 頭囲SDS/2（Cheung 2026）。−2 未満で相対的大頭（Dauber 2026 の大基準）。

import { HC_LMS, type LMSRow, type Sex } from "./hcTable";
import { HEIGHT_TABLE, HEIGHT_MAX_MONTH } from "./heightTable";
import { katoLMS, KATO_MAX_AGE } from "./katoFormula";

export type { Sex };
export const AGE_MIN = 0;
export const AGE_MAX = 18;
const ANZO_FROM = 7;

export function getLMS(sex: Sex, age: number): LMSRow {
  if (age <= KATO_MAX_AGE) return katoLMS(sex, age);
  if (age < ANZO_FROM) {
    const a = katoLMS(sex, KATO_MAX_AGE);
    const b = anzoLMS(sex, ANZO_FROM);
    const f = (age - KATO_MAX_AGE) / (ANZO_FROM - KATO_MAX_AGE);
    return { age, L: a.L + f * (b.L - a.L), M: a.M + f * (b.M - a.M), S: a.S + f * (b.S - a.S) };
  }
  return anzoLMS(sex, age);
}

function anzoLMS(sex: Sex, age: number): LMSRow {
  const t = HC_LMS[sex];
  if (age <= t[0].age) return t[0];
  if (age >= t[t.length - 1].age) return t[t.length - 1];
  let i = 0;
  while (i < t.length - 2 && t[i + 1].age < age) i++;
  const a = t[i];
  const b = t[i + 1];
  const f = (age - a.age) / (b.age - a.age);
  return {
    age,
    L: a.L + f * (b.L - a.L),
    M: a.M + f * (b.M - a.M),
    S: a.S + f * (b.S - a.S),
  };
}

export function calcZScore(x: number, L: number, M: number, S: number): number {
  if (Math.abs(L) < 1e-6) return Math.log(x / M) / S;
  return (Math.pow(x / M, L) - 1) / (L * S);
}

export function zToValue(z: number, L: number, M: number, S: number): number {
  if (Math.abs(L) < 1e-6) return M * Math.exp(z * S);
  const inner = 1 + L * S * z;
  if (inner <= 0) return 0;
  return M * Math.pow(inner, 1 / L);
}

/** 身長 SDS（学会 2000年基準、月齢ごとの平均と SD）。18歳以上は17歳11か月の値で参考値。 */
export function heightSds(
  sex: Sex,
  ageYears: number,
  heightCm: number
): { z: number; mean: number; sd: number; capped: boolean } {
  const months = Math.floor(ageYears * 12 + 1e-9);
  const capped = months > HEIGHT_MAX_MONTH;
  const m = Math.min(Math.max(months, 0), HEIGHT_MAX_MONTH);
  const year = Math.floor(m / 12);
  const month = m % 12;
  const mean = HEIGHT_TABLE[sex].mean[month][year];
  const sd = HEIGHT_TABLE[sex].sd[month][year];
  return { z: (heightCm - mean) / sd, mean, sd, capped };
}
