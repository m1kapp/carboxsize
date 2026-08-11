/**
 * 다나와에서 공차중량을 긁어 cars.ts의 `weight` 필드를 채운다.
 *
 *   npm run sync:weights
 *
 * 기계식 주차장은 치수뿐 아니라 무게로도 막힌다(중형 2,350kg · 대형 2,650kg).
 * 트림마다 무게가 갈리는데, 못 들어가면 그만인 판정이라 가장 무거운 트림을 쓴다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { fetchSpec, mapLimit } from "./lib/danawa.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const path = resolve(root, "src/data/cars.ts");
let source = readFileSync(path, "utf8");

const targets = [...source.matchAll(/\{ name: "([^"]+)"[^}]*?no: (\d+) \},/g)].map((m) => ({
  line: m[0],
  name: m[1],
  no: Number(m[2]),
}));
console.log(`${targets.length}대 조회 시작...\n`);

const results = await mapLimit(targets, 5, async (car) => {
  const spec = await fetchSpec(car.no).catch(() => null);
  return { ...car, weight: spec?.weight ?? null };
});

let filled = 0;
for (const car of results) {
  if (!car.weight) {
    console.log(`  ? ${car.name} — 공차중량 없음`);
    continue;
  }
  // trunk 뒤, brand 앞에 끼워 넣는다(이미 있으면 값만 교체)
  const next = car.line.includes(", weight: ")
    ? car.line.replace(/, weight: \d+/, `, weight: ${car.weight}`)
    : car.line.replace(/, brand: /, `, weight: ${car.weight}, brand: `);
  if (next !== car.line) {
    source = source.replace(car.line, next);
    filled++;
  }
}

writeFileSync(path, source);
console.log(`\n✓ ${filled}대 공차중량 기록 (전체 ${targets.length})`);
