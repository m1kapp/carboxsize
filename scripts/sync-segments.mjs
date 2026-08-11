/**
 * 다나와 세그먼트("중형SUV" "준대형" …)를 cars.ts에 채운다.
 *
 *   npm run sync:segments
 *
 * 비교 조합을 고를 때 쓴다. 부피만 보면 "그랜저 vs 셀토스" 같은 조합이 나오는데,
 * 아무도 그렇게 고민하지 않는다. 같은 세그먼트 안에서 골라야 실제 후보가 된다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { fetchModelInfo, mapLimit } from "./lib/danawa.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = resolve(root, "src/data/cars.ts");
let source = readFileSync(path, "utf8");

const targets = [...source.matchAll(/\{ name: "([^"]+)"[^}]*?no: (\d+) \},/g)].map((m) => ({
  line: m[0], name: m[1], no: Number(m[2]),
}));
console.log(`${targets.length}대 조회...\n`);

const results = await mapLimit(targets, 5, async (car) => ({
  ...car,
  segment: (await fetchModelInfo(car.no).catch(() => null))?.segment ?? null,
}));

let filled = 0;
const counts = {};
for (const car of results) {
  if (!car.segment) { console.log(`  ? ${car.name} — 세그먼트 없음`); continue; }
  counts[car.segment] = (counts[car.segment] ?? 0) + 1;
  const next = car.line.includes(", segment: ")
    ? car.line.replace(/, segment: "[^"]*"/, `, segment: "${car.segment}"`)
    : car.line.replace(/, no: /, `, segment: "${car.segment}", no: `);
  if (next !== car.line) { source = source.replace(car.line, next); filled++; }
}

writeFileSync(path, source);
console.log(`\n✓ ${filled}대 기록`);
for (const [seg, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`   ${seg} ${n}`);
