/**
 * 비교 조합을 골라 src/data/pairs.ts 를 만든다. (build 첫 단계)
 *
 * 앱의 "자주 비교하는 조합"과 빌드가 만드는 비교 페이지가 같은 목록을 봐야 한다.
 * 두 곳에서 따로 고르면 화면에 있는 조합이 색인엔 없는 일이 생긴다.
 *
 * 고르는 규칙
 *  · 같은 세그먼트 — 부피만 보면 "그랜저 vs 셀토스"가 나오는데 아무도 그렇게 고민하지 않는다
 *  · 코어 차이 15% 이내 — 체급이 다르면 비교가 아니다
 *  · 둘 다 팔리는 차 — 판매 하위 조합은 검색되지 않는다
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LIMIT = 120;

const carsSource = readFileSync(resolve(root, "src/data/cars.ts"), "utf8");
const cars = [...carsSource.matchAll(
  /\{ name: "([^"]+)", xSize: (\d+), ySize: (\d+), zSize: (\d+), xInSize: (\d+)[^}]*\}/g,
)].map((m) => {
  const line = m[0];
  const str = (k) => new RegExp(`${k}: "([^"]+)"`).exec(line)?.[1] ?? null;
  return {
    name: m[1], x: +m[2], y: +m[3], z: +m[4], xin: +m[5],
    brand: str("brand"), segment: str("segment"),
    no: Number(/\bno: (\d+)/.exec(line)?.[1] ?? 0) || null,
  };
}).filter((c) => c.brand);
if (cars.length < 50) throw new Error(`cars.ts 파싱 실패 — ${cars.length}대`);

const salesSource = readFileSync(resolve(root, "src/data/sales.ts"), "utf8");
const latest = salesSource.match(/"(\d{4}-\d{2})": \{([\s\S]*?)\n  \},/);
const units = {};
for (const m of latest[2].matchAll(/(\d+): (\d+),/g)) units[m[1]] = Number(m[2]);

const core = (c) => (c.xin * c.y * c.z) / 1e9;
const sellable = cars
  .filter((c) => c.no && units[c.no] && c.segment && c.segment !== "상용")
  .sort((a, b) => units[b.no] - units[a.no]);

const pairs = [];
for (let i = 0; i < sellable.length; i++) {
  for (let j = i + 1; j < sellable.length; j++) {
    const [a, b] = [sellable[i], sellable[j]];
    if (a.segment !== b.segment) continue;
    if (Math.abs(core(a) - core(b)) / Math.max(core(a), core(b)) > 0.15) continue;
    pairs.push({ a, b, score: Math.min(units[a.no], units[b.no]) });
  }
}
pairs.sort((p, q) => q.score - p.score);
const top = pairs.slice(0, LIMIT);

const lines = top
  .map(({ a, b }) => `  ["${a.name}", "${b.name}"],`)
  .join("\n");

writeFileSync(resolve(root, "src/data/pairs.ts"), `// 이 파일은 scripts/gen-pairs.mjs 가 만듭니다. 손으로 고치지 마세요.
// 갱신: npm run build (또는 node scripts/gen-pairs.mjs)
import { CARS, type Car } from "./cars";

/**
 * 자주 저울질하는 조합 — 같은 세그먼트, 코어 차이 15% 이내, 둘 다 팔리는 차.
 * 판매량이 높은 순이라 앞쪽일수록 실제로 많이 비교하는 조합이다.
 *
 * 화면의 "자주 비교하는 조합"과 빌드가 만드는 비교 페이지가 이 목록을 함께 본다.
 */
export const PAIR_NAMES: [string, string][] = [
${lines}
];

const byName = (name: string) => CARS.find((c) => c.name === name);

export const PAIRS: [Car, Car][] = PAIR_NAMES
  .map(([a, b]) => [byName(a), byName(b)] as const)
  .filter((pair): pair is [Car, Car] => Boolean(pair[0] && pair[1]));
`);

console.log(`✓ 비교 조합 ${top.length}쌍 (후보 ${pairs.length}쌍 중) → src/data/pairs.ts`);
