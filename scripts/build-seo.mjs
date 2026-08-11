/**
 * 빌드 뒤 dist/index.html 에 검색엔진이 읽을 내용을 심는다.
 *
 *   npm run build   (vite build 뒤 자동 실행)
 *
 * 이 앱은 SPA라 초기 HTML의 <body>가 비어 있다. 크롤러가 JS를 실행해주기를 기대할 수도
 * 있지만, 확실한 쪽은 서버가 내려주는 HTML에 내용을 담아두는 것이다.
 *
 * #root 안에 넣는 이유: React가 createRoot로 마운트하면서 통째로 갈아치우므로 사용자에게는
 * 한 프레임도 보이지 않고, 크롤러는 초기 HTML을 그대로 읽는다. 화면에 없는 걸 심는 게
 * 아니라 화면에 있는 걸 미리 적어두는 것이라 클로킹이 아니다.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { renderOg } from "./lib/og.mjs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://carboxsize.m1k.app";

const carsSource = readFileSync(resolve(root, "src/data/cars.ts"), "utf8");
const cars = [...carsSource.matchAll(
  /\{ name: "([^"]+)", xSize: (\d+), ySize: (\d+), zSize: (\d+), xInSize: (\d+)(?:[^}]*?brand: "([^"]+)")?[^}]*\}/g,
)].map((m) => ({
  name: m[1],
  x: +m[2], y: +m[3], z: +m[4], xin: +m[5],
  brand: m[6] ?? null,
  segment: /segment: "([^"]+)"/.exec(m[0])?.[1] ?? null,
  no: Number(/\bno: (\d+)/.exec(m[0])?.[1] ?? 0) || null,
}));
if (cars.length < 50) throw new Error(`cars.ts 파싱 실패 — ${cars.length}대만 읽혔습니다`);

const m3 = (a, b, c) => Math.round((a * b * c * 100) / 1e9) / 100;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const real = cars.filter((c) => c.brand);
const brands = [...new Set(real.map((c) => c.brand))];

/** 상식 탭과 같은 내용 — 검색결과에 Q&A로 노출될 수 있게 FAQPage로도 함께 낸다 */
const FAQ = [
  ["코어와 외형이 뭐가 다른가요?",
   "코어는 축거 × 전폭 × 전고로, 앞뒤 범퍼를 뺀 바퀴 사이 부피입니다. 외형은 전장 × 전폭 × 전고로 차가 주차장에서 실제로 차지하는 부피입니다."],
  ["코어가 크면 실내가 넓은 건가요?",
   "아닙니다. 코어는 차 바깥 치수로 만든 상자라 차체 두께와 지상고가 포함됩니다. 미국 EPA 실내용적이 공개된 24대와 대조하면 코어의 약 42%가 실제 승객+화물 공간이며, 순위는 같은 차급 안에서만 얼추 맞습니다."],
  ["왜 축거로 재나요?",
   "축거 × 폭으로 차 크기를 재는 방식은 미국 연비 규제가 쓰는 footprint와 같습니다(49 CFR 523.2). 전장은 범퍼 디자인으로 변하지만 축거는 차의 뼈대라 잘 변하지 않습니다."],
  ["기계식 주차장에 못 들어가는 차가 있나요?",
   "주차장법 시행규칙 제16조의2 기준으로 중형 기계식은 길이 5.2m·너비 2.0m·높이 1.85m·무게 2,350kg 이하입니다. 여기 실린 100종 중 22대가 중형에 들어가지 못하고, 그중 12대는 대형도 불가합니다. 배터리를 얹은 전기차가 치수는 통과해도 무게에서 걸리는 경우가 많습니다."],
  ["일반 주차장 규격은 얼마인가요?",
   "일반형 주차단위구획은 너비 2.5m × 길이 5.0m입니다. 2019년 3월부터 이 규격이며 그 전에는 너비가 2.3m였습니다."],
  ["전폭에 사이드미러가 포함되나요?",
   "포함되지 않습니다. 미러를 뺀 값으로 통일했습니다. 출처에 따라 미러 포함·접힘 값이 섞이면 차끼리 비교가 깨지기 때문입니다."],
];

const rows = real
  .map((c) => {
    const core = m3(c.xin, c.y, c.z);
    const box = m3(c.x, c.y, c.z);
    return `<tr><th scope="row">${esc(c.name)}</th><td>${esc(c.brand)}</td><td>${c.x}</td><td>${c.y}</td><td>${c.z}</td><td>${c.xin}</td><td>${core}</td><td>${box}</td></tr>`;
  })
  .join("");

const content = `
<h1>Car Box Size — 자동차 크기 비교</h1>
<p>차를 상자로 바꿔서 크기를 비교합니다. 코어(축거 × 전폭 × 전고)와 외형(전장 × 전폭 × 전고)을 m³로 환산해 국산·수입차 ${real.length}종을 한 줄로 세웁니다. 월별 판매량 순위와 기계식 주차 가능 여부도 함께 볼 수 있습니다.</p>
<p>수록 브랜드: ${brands.map(esc).join(", ")}</p>

<h2>차량 제원 ${real.length}종</h2>
<table>
<caption>전장·전폭·전고·축거(mm)와 코어·외형(m³)</caption>
<thead><tr><th>차종</th><th>브랜드</th><th>전장</th><th>전폭</th><th>전고</th><th>축거</th><th>코어</th><th>외형</th></tr></thead>
<tbody>${rows}</tbody>
</table>

<h2>자동차 크기 상식</h2>
<dl>${FAQ.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join("")}</dl>

<p>제원과 판매량 출처: <a href="https://auto.danawa.com/auto/">다나와 자동차</a></p>
`.trim();

const faqLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

const path = resolve(root, "dist/index.html");
let html = readFileSync(path, "utf8");

if (!html.includes('<div id="root">')) throw new Error("dist/index.html에서 #root를 못 찾았습니다");
html = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
html = html.replace("</head>", `  <link rel="canonical" href="${SITE}/" />\n    <script type="application/ld+json">${faqLd}</script>\n  </head>`);
writeFileSync(path, html);

// robots.txt / sitemap.xml — 정적 파일이 SPA rewrite보다 우선한다
const today = new Date().toISOString().slice(0, 10);
writeFileSync(resolve(root, "dist/robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(resolve(root, "dist/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n  </url>\n</urlset>\n`);

console.log(`✓ SEO: 차량 ${real.length}종 + FAQ ${FAQ.length}개 주입, robots.txt·sitemap.xml 생성`);


/** build-seo 는 x/y/z/xin 으로, og.mjs 는 전장·전고·축거 이름으로 부른다 — 여기서 한 번만 맞춘다 */
const toOgCar = (c) => ({ xSize: c.x, zSize: c.z, xInSize: c.xin, label: c.name.split(" (")[0] });

// 메인 OG — 대표 차 두 대로 "차를 상자로 잰다"를 보여준다
{
  const pick = (name) => real.find((c) => c.name.startsWith(name));
  // 크기 대비가 큰 두 대를 세운다 — 나란히 놓았을 때 한눈에 차이가 보여야 한다
  const [big, small] = [pick("스타리아") ?? real[0], pick("모닝") ?? real[1]];
  const png = await renderOg({
    title: "Car Box Size",
    subtitle: `국산·수입차 ${real.length}종을 상자로 바꿔서 크기 비교`,
    headline: { value: `${real.length}종`, label: "매달 갱신" },
    cars: [big, small].map(toOgCar),
    footer: "코어 = 축거 × 전폭 × 전고 · 외형 = 전장 × 전폭 × 전고",
  });
  writeFileSync(resolve(root, "dist/og-image.png"), png);
}

// ── 비교 페이지 ─────────────────────────────────────────────────────────
// "쏘렌토 vs 싼타페 크기"처럼 조합으로 검색하는 사람을 위한 페이지.
// 아무 조합이나 만들면 색인만 낭비하므로, 실제로 저울질하는 쌍만 고른다.
//   · 같은 세그먼트 — 부피만 보면 "그랜저 vs 셀토스"가 나오는데 아무도 그렇게 안 고민한다
//   · 코어 차이 15% 이내 — 체급이 다르면 비교가 아니다
//   · 둘 다 팔리는 차 — 안 팔리는 차 조합은 검색되지 않는다
const core = (c) => m3(c.xin, c.y, c.z);
const slug = (c) => c.name.split(" (")[0].replace(/\s+/g, "");

// 조합은 gen-pairs.mjs 가 고른다(build 첫 단계). 화면의 "자주 비교하는 조합"과 같은 목록을
// 써야 한다 — 두 곳에서 따로 고르면 화면엔 있는데 색인엔 없는 조합이 생긴다.
const pairsSource = readFileSync(resolve(root, "src/data/pairs.ts"), "utf8");
const byName = new Map(real.map((c) => [c.name, c]));
const TOP = [...pairsSource.matchAll(/\["([^"]+)", "([^"]+)"\]/g)]
  .map((m) => ({ a: byName.get(m[1]), b: byName.get(m[2]) }))
  .filter((p) => p.a && p.b);
if (!TOP.length) throw new Error("pairs.ts 에서 조합을 못 읽었습니다 — gen-pairs 를 먼저 돌리세요");

const label = (c) => c.name.split(" (")[0];
const diffLine = (a, b, get, unit, verb) => {
  const d = get(a) - get(b);
  if (d === 0) return `${label(a)}와 ${label(b)}는 ${verb.noun}이 같습니다.`;
  const [win, lose] = d > 0 ? [a, b] : [b, a];
  return `${label(win)}가 ${label(lose)}보다 ${unit(Math.abs(d))} ${verb.more}.`;
};

for (const { a, b } of TOP) {
  const title = `${label(a)} vs ${label(b)} 크기 비교 — Car Box Size`;
  const desc =
    `${label(a)}와 ${label(b)}의 전장·전폭·전고·축거를 나란히 비교합니다. ` +
    `코어 ${core(a)} vs ${core(b)}m³, 외형 ${m3(a.x, a.y, a.z)} vs ${m3(b.x, b.y, b.z)}m³.`;
  const path = `/compare/${slug(a)}-vs-${slug(b)}`;

  const body = `
<h1>${esc(label(a))} vs ${esc(label(b))} 크기 비교</h1>
<p>${esc(desc)}</p>
<table>
<thead><tr><th>항목</th><th>${esc(label(a))}</th><th>${esc(label(b))}</th></tr></thead>
<tbody>
<tr><th scope="row">전장(mm)</th><td>${a.x}</td><td>${b.x}</td></tr>
<tr><th scope="row">전폭(mm)</th><td>${a.y}</td><td>${b.y}</td></tr>
<tr><th scope="row">전고(mm)</th><td>${a.z}</td><td>${b.z}</td></tr>
<tr><th scope="row">축거(mm)</th><td>${a.xin}</td><td>${b.xin}</td></tr>
<tr><th scope="row">코어(m³)</th><td>${core(a)}</td><td>${core(b)}</td></tr>
<tr><th scope="row">외형(m³)</th><td>${m3(a.x, a.y, a.z)}</td><td>${m3(b.x, b.y, b.z)}</td></tr>
</tbody>
</table>
<ul>
<li>${esc(diffLine(a, b, (c) => c.xin, (v) => `${v}mm`, { noun: "축거", more: "축거가 깁니다" }))}</li>
<li>${esc(diffLine(a, b, (c) => c.x, (v) => `${v}mm`, { noun: "전장", more: "전장이 깁니다" }))}</li>
<li>${esc(diffLine(a, b, (c) => c.z, (v) => `${v}mm`, { noun: "전고", more: "전고가 높습니다" }))}</li>
<li>${esc(diffLine(a, b, core, (v) => `${v.toFixed(2)}m³`, { noun: "코어", more: "코어가 큽니다" }))}</li>
</ul>
<p><a href="/">국산·수입차 ${real.length}종 크기 비교 전체 보기</a></p>
`.trim();

  // 조합 전용 OG — 공유될 때 그 두 대가 그대로 보인다
  const ogName = `${slug(a)}-vs-${slug(b)}.png`;
  const diff = Math.abs(core(a) - core(b));
  const bigger = core(a) >= core(b) ? a : b;
  const png = await renderOg({
    title: `${label(a)} vs ${label(b)}`,
    subtitle: `${a.segment} · 전장 ${a.x} vs ${b.x}mm · 축거 ${a.xin} vs ${b.xin}mm`,
    headline: diff >= 0.01
      ? { value: `+${diff.toFixed(2)}m³`, label: `${label(bigger)}가 코어 더 큼` }
      : { value: "≈", label: "코어가 거의 같음" },
    cars: [a, b].map(toOgCar),
    footer: "코어 = 축거 × 전폭 × 전고",
  });
  mkdirSync(resolve(root, "dist/og-share"), { recursive: true });
  writeFileSync(resolve(root, `dist/og-share/${ogName}`), png);
  const ogUrl = `${SITE}/og-share/${encodeURIComponent(ogName)}`;

  let page = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
    .replace(`href="${SITE}/"`, `href="${SITE}${path}"`)
    .replace(new RegExp(`${SITE}/og-image\\.png`, "g"), ogUrl)
    .replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${body}</div>`);

  // 한글 경로와 퍼센트 인코딩 경로를 둘 다 만든다.
  // 브라우저 주소창은 한글 그대로 보내지만 크롤러·공유 링크는 인코딩해서 보내는데,
  // 인코딩된 쪽이 파일에 안 걸리면 SPA rewrite로 새서 전부 메인 페이지가 된다(실제로 그랬다).
  for (const variant of new Set([path, `/compare/${encodeURIComponent(`${slug(a)}-vs-${slug(b)}`)}`])) {
    const dir = resolve(root, `dist${variant}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "index.html"), page);
  }
}

// sitemap 다시 — 메인 + 비교 페이지 전부
const urls = [`${SITE}/`, ...TOP.map(({ a, b }) => `${SITE}/compare/${slug(a)}-vs-${slug(b)}`)];
writeFileSync(resolve(root, "dist/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url>\n    <loc>${encodeURI(u)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`).join("\n") +
  `\n</urlset>\n`);

console.log(`✓ 비교 페이지 ${TOP.length}개 + OG 이미지 ${TOP.length + 1}장`);
