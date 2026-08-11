/**
 * 비교 조합 썸네일을 public/og 에 굽는다. (build 두 번째 단계)
 *
 * 공유될 때 뜨는 OG 이미지를 목록 썸네일로도 쓴다 — 같은 그림이라야 "아까 본 그거"로 이어진다.
 * 다만 OG 원본은 1200×630에 145KB라 목록에 16장 깔면 2MB가 넘는다. 여기서는 절반 크기로 굽는다.
 *
 * dist 가 아니라 public 에 두는 이유: vite dev 서버도 public 을 서빙해서 개발 중에도 보인다.
 * 생성물이라 .gitignore 에 넣어두고, 빌드할 때마다 다시 만든다.
 */
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { renderOg, THUMB_WIDTH } from "./lib/og.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const carsSource = readFileSync(resolve(root, "src/data/cars.ts"), "utf8");
const cars = new Map();
for (const m of carsSource.matchAll(
  /\{ name: "([^"]+)", xSize: (\d+), ySize: (\d+), zSize: (\d+), xInSize: (\d+)[^}]*\}/g,
)) {
  cars.set(m[1], {
    name: m[1], x: +m[2], y: +m[3], z: +m[4], xin: +m[5],
    segment: /segment: "([^"]+)"/.exec(m[0])?.[1] ?? null,
  });
}

const pairsSource = readFileSync(resolve(root, "src/data/pairs.ts"), "utf8");
const pairs = [...pairsSource.matchAll(/\["([^"]+)", "([^"]+)"\]/g)]
  .map((m) => [cars.get(m[1]), cars.get(m[2])])
  .filter(([a, b]) => a && b);
if (!pairs.length) throw new Error("pairs.ts 에서 조합을 못 읽었습니다");

const m3 = (a, b, c) => Math.round((a * b * c * 100) / 1e9) / 100;
const core = (c) => m3(c.xin, c.y, c.z);
const label = (c) => c.name.split(" (")[0];
const slug = (c) => label(c).replace(/\s+/g, "");

const dir = resolve(root, "public/og");
rmSync(dir, { recursive: true, force: true }); // 조합이 바뀌면 옛 썸네일이 남는다
mkdirSync(dir, { recursive: true });

for (const [a, b] of pairs) {
  const diff = Math.abs(core(a) - core(b));
  const bigger = core(a) >= core(b) ? a : b;
  const png = await renderOg({
    width: THUMB_WIDTH,
    title: `${label(a)} vs ${label(b)}`,
    subtitle: `${a.segment ?? ""} · 전장 ${a.x} vs ${b.x}mm`,
    headline: diff >= 0.01
      ? { value: `+${diff.toFixed(2)}m³`, label: `${label(bigger)}가 코어 더 큼` }
      : { value: "≈", label: "코어가 거의 같음" },
    cars: [a, b].map((c) => ({ xSize: c.x, zSize: c.z, xInSize: c.xin, label: label(c) })),
    footer: "코어 = 축거 × 전폭 × 전고",
  });
  writeFileSync(resolve(dir, `${slug(a)}-vs-${slug(b)}.png`), png);
}

console.log(`✓ 썸네일 ${pairs.length}장 → public/og`);
