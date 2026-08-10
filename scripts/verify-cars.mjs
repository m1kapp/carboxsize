/**
 * cars.ts의 치수를 다나와 제원과 대조한다.
 *
 *   npm run verify:cars
 *
 * 다나와와 다르다고 곧바로 틀린 건 아니다. 전폭은 미러 포함/접힘 기준이 섞여 있고,
 * 트림에 따라 전고가 갈리기도 한다(README "제원 기준" 참고). 그래서 이 스크립트는
 * 값을 고치지 않고 차이만 보고한다 — 판단은 사람이 하고, 확정하면 cars.ts에 직접 적는다.
 *
 * 종료 코드: 차이가 있으면 1. CI에 걸어두면 다나와가 값을 바꿨을 때 알 수 있다.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { fetchSpec, mapLimit } from "./lib/danawa.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** 다나와와 다르지만 확인 끝난 값 — 이유를 적어둔다. 여기 있으면 차이로 세지 않는다. */
const ACCEPTED = {
  3825: "사이버트럭 — 전폭은 미러 제외(공식 2032). 다나와 2200은 미러 접힘값",
  4513: "폴레스타4 — 전폭은 미러 제외(공식 2008). 다나와 2067은 미러 접힘값",
  4665: "K8 — 전고 1480은 20인치 사양. 다나와 1455는 기본 사양",
  4506: "카이엔 — 전고는 변형별 1648~1698 범위 안",
  3746: "우라칸 — 전고 1165가 EVO 공식값",
  3526: "우루스 — 람보르기니 공식 제원(5113×2017×1638 / 3002) 기준",
};

const source = readFileSync(resolve(root, "src/data/cars.ts"), "utf8");
const cars = [];
for (const m of source.matchAll(
  /\{ name: "([^"]+)", xSize: (\d+), ySize: (\d+), zSize: (\d+), xInSize: (\d+)(?:[^}]*?no: (\d+))?[^}]*\}/g,
)) {
  if (!m[6]) continue; // 기준자(성인사람·주차장)는 다나와에 없다
  cars.push({
    name: m[1],
    no: Number(m[6]),
    xSize: Number(m[2]), ySize: Number(m[3]), zSize: Number(m[4]), xInSize: Number(m[5]),
  });
}

console.log(`${cars.length}대 대조 시작...\n`);

const results = await mapLimit(cars, 5, async (car) => {
  const spec = await fetchSpec(car.no);
  if (!spec) return { car, unavailable: true };

  const diffs = [];
  for (const key of ["xSize", "ySize", "zSize", "xInSize"]) {
    if (!spec.all[key].includes(car[key])) {
      diffs.push(`${key}: 파일=${car[key]} 다나와=[${spec.all[key].join(", ")}]`);
    }
  }
  return { car, diffs };
});

let unresolved = 0;
for (const { car, diffs, unavailable } of results) {
  if (unavailable) {
    console.log(`? ${car.name} (${car.no}) — 다나와에 제원 없음(미출시일 수 있음)`);
    continue;
  }
  if (!diffs.length) continue;

  const note = ACCEPTED[car.no];
  if (note) {
    console.log(`~ ${car.name} — 확인됨: ${note}`);
  } else {
    unresolved++;
    console.log(`X ${car.name} (${car.no})`);
    for (const d of diffs) console.log(`    ${d}`);
  }
}

console.log(`\n확인 안 된 차이: ${unresolved}건`);
process.exit(unresolved ? 1 : 0);
