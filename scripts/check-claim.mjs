/**
 * m1k.app 방문자 트래커 등록·귀속 상태를 실제로 확인한다.
 *
 *   npm run check:claim
 *
 * 화면 크레딧의 "미인증" 표시는 kit이 서버에 물어보는 게 아니라 `claimed` prop으로만 그린다.
 * 그래서 config의 값이 실제 상태와 어긋날 수 있다 — 이 스크립트가 그걸 잡는다.
 * 종료 코드: 어긋나면 1.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const config = readFileSync(resolve(root, "src/config.ts"), "utf8");

const slug = config.match(/slug:\s*"([^"]+)"/)?.[1];
const claimedInConfig = /claimed:\s*true/.test(config);
if (!slug) throw new Error("src/config.ts에서 tracker.slug를 못 읽었습니다");

const site = await fetch(`https://www.m1k.app/api/sites/${encodeURIComponent(slug)}`).then((r) =>
  r.ok ? r.json() : null,
);
if (!site) {
  console.error(`X slug "${slug}" 가 m1k.app에 없습니다 — npx m1kkit track 으로 등록하세요`);
  process.exit(1);
}

// 귀속되면 소유자 목록(builders)에 뜬다. 사이트 단건 API는 소유자를 노출하지 않는다.
const builders = await fetch("https://www.m1k.app/api/builders").then((r) => (r.ok ? r.json() : []));
const rows = Array.isArray(builders) ? builders : (builders.builders ?? []);
const owner = rows.find((b) => (b.sites ?? []).some((s) => s.slug === slug));

console.log(`사이트   ${site.title}`);
console.log(`주소     ${site.url}`);
console.log(`누적     ${site.total}회`);
console.log(`귀속     ${owner ? `${owner.handle ?? owner.name}` : "미귀속"}`);

const claimedActual = Boolean(owner);
if (claimedActual !== claimedInConfig) {
  console.error(
    `\nX config의 claimed(${claimedInConfig})가 실제(${claimedActual})와 다릅니다 — src/config.ts를 고치세요`,
  );
  process.exit(1);
}
console.log("\n✓ config와 실제 상태가 일치합니다");
