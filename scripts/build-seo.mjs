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
import { readFileSync, writeFileSync } from "node:fs";
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
