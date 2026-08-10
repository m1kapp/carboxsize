/**
 * 다나와 판매실적 -> src/data/sales.ts 재생성.
 *
 *   npm run sync:sales              최근 6개월
 *   npm run sync:sales -- --months=12
 *
 * 판매량은 매달 바뀌는 값이라 손으로 옮기면 반드시 틀어진다. 이 스크립트가 유일한 갱신 경로다.
 * 우리 목록(cars.ts)에 있는 `no`만 남기므로, 차를 추가하기 전에는 그 차의 판매량도 안 들어온다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { fetchSales, mapLimit } from "./lib/danawa.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** 우리 목록에 있는 수입 브랜드. 다나와는 수입차를 브랜드별로만 내려준다. */
const IMPORT_BRANDS = {
  362: "BMW", 349: "벤츠", 611: "테슬라", 459: "볼보", 371: "아우디",
  380: "BYD", 376: "폭스바겐", 367: "미니", 381: "포르쉐", 458: "폴스타", 413: "푸조",
};
const DOMESTIC_BRANDS = new Set(["현대", "기아", "제네시스", "르노", "KGM", "쉐보레"]);

const monthsBack = Number(process.argv.find((a) => a.startsWith("--months="))?.split("=")[1] ?? 6);

/** 이번 달은 아직 집계 전이라 지난달부터 거슬러 올라간다. */
function recentMonths(count) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

const carsSource = readFileSync(resolve(root, "src/data/cars.ts"), "utf8");
const cars = new Map();
for (const m of carsSource.matchAll(/name: "([^"]+)"[^}]*?brand: "([^"]+)"[^}]*?no: (\d+)/g)) {
  cars.set(Number(m[3]), { name: m[1], brand: m[2] });
}
if (!cars.size) throw new Error("cars.ts에서 차를 하나도 못 읽었습니다 — 파서를 확인하세요");

const months = recentMonths(monthsBack);
console.log(`대상 ${months.length}개월: ${months.join(", ")}`);
console.log(`우리 목록 ${cars.size}대 (수입 브랜드 ${Object.keys(IMPORT_BRANDS).length}개 조회)\n`);

const jobs = months.flatMap((month) => [
  { month, brand: null },
  ...Object.keys(IMPORT_BRANDS).map((brand) => ({ month, brand })),
]);

const fetched = await mapLimit(jobs, 5, async ({ month, brand }) => ({
  month,
  rows: await fetchSales(month, brand),
}));

const byMonth = new Map(months.map((m) => [m, new Map()]));
for (const { month, rows } of fetched) {
  for (const [no, row] of Object.entries(rows)) {
    if (cars.has(Number(no))) byMonth.get(month).set(Number(no), row);
  }
}

const importedCount = {};
const blocks = [];
for (const month of months) {
  const rows = [...byMonth.get(month)].sort((a, b) => b[1].units - a[1].units);
  if (!rows.length) throw new Error(`${month} 판매량이 비었습니다 — 다나와 마크업이 바뀌었을 수 있습니다`);

  importedCount[month] = rows.filter(([no]) => !DOMESTIC_BRANDS.has(cars.get(no).brand)).length;
  const lines = rows.map(([no, row]) => `    ${no}: ${row.units},`.padEnd(20) + `// ${row.name}`);
  blocks.push(`  "${month}": {\n${lines.join("\n")}\n  },`);
  console.log(`${month}  ${rows.length}대 (수입 ${importedCount[month]})`);
}

const out = `// 이 파일은 scripts/sync-sales.mjs 가 만듭니다. 손으로 고치지 마세요.
// 갱신: npm run sync:sales
/**
 * 다나와 자동차 판매실적(모델별)에서 가져온 국내 신차 등록 대수.
 * 키가 \`Car.no\`(다나와 모델 번호)라서 이름 매칭 없이 정확히 붙는다.
 *
 * 출처: https://auto.danawa.com/auto/?Work=record&Tab=Model
 */
export const SALES: Record<string, Record<number, number>> = {
${blocks.join("\n")}
};

/** 최신 월이 앞. */
export const SALES_MONTHS = Object.keys(SALES).sort().reverse();
export const LATEST_MONTH = SALES_MONTHS[0];

export const salesOf = (no?: number, month: string = LATEST_MONTH) =>
  no != null ? SALES[month]?.[no] : undefined;

/** "2026-07" -> "2026년 7월" */
export const formatMonth = (ym: string) =>
  \`\${Number(ym.slice(0, 4))}년 \${Number(ym.slice(5, 7))}월\`;

/** 그 달 판매량의 출처가 된 다나와 판매실적 페이지 */
export const danawaRecordUrl = (month: string) =>
  \`https://auto.danawa.com/auto/?Work=record&Tab=Model&Month=\${month}-00&MonthTo=\`;

/**
 * 그 달에 판매량이 잡힌 수입차 모델 수.
 * 다나와는 수입차를 브랜드마다 다른 시점에 집계해서, 가장 최근 달은 아직 덜 찬다.
 */
const IMPORTED_COUNT: Record<string, number> = {
${months.map((m) => `  "${m}": ${importedCount[m]},`).join("\n")}
};

const FULL_IMPORTED = Math.max(...Object.values(IMPORTED_COUNT));

/** 수입차 집계가 아직 덜 찬 달인지 — 맞으면 화면에 그렇다고 적어준다. */
export const importedPending = (month: string) =>
  (IMPORTED_COUNT[month] ?? 0) < FULL_IMPORTED * 0.7;
`;

writeFileSync(resolve(root, "src/data/sales.ts"), out);
console.log(`\n✓ src/data/sales.ts 갱신 (${months.length}개월)`);
