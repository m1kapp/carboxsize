/** 빌드 산출물의 공유 메타와 OG 이미지가 서로 맞는지 전수 검사한다. */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { projectPoint } from "./lib/box3d.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

const fail = (message) => {
  throw new Error(`SEO 검증 실패: ${message}`);
};

// 다나와 3/4 사진과 앱 CSS 카드의 전장선은 화면 오른쪽으로 갈수록 올라간다.
// X축 회전 부호가 뒤집히면 OG 박스만 반대로 기우므로 산출물 생성 전에 막는다.
const lengthEnds = [projectPoint([-1, 0, 0]), projectPoint([1, 0, 0])].sort((a, b) => a.x - b.x);
if (lengthEnds[1].y >= lengthEnds[0].y) fail("3D 박스 전장선의 X축 투영 방향이 앱 카드와 반대임");

function walk(dir, extension) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) return walk(path, extension);
    return extname(entry.name) === extension ? [path] : [];
  });
}

function pngSize(path) {
  const header = readFileSync(path).subarray(0, 24);
  if (header.toString("hex", 0, 8) !== "89504e470d0a1a0a") fail(`${path}가 PNG가 아님`);
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
}

const ogImages = [resolve(dist, "og-image.png"), ...walk(resolve(dist, "og-share"), ".png")];
for (const path of ogImages) {
  const { width, height } = pngSize(path);
  if (width !== 1200 || height !== 630) fail(`${path}: ${width}x${height}, 1200x630 필요`);
  if (statSync(path).size >= 5 * 1024 * 1024) fail(`${path}: 5MB 이상`);
}

const requiredMeta = [
  ["name", "description"],
  ["name", "robots"],
  ["property", "og:title"],
  ["property", "og:description"],
  ["property", "og:url"],
  ["property", "og:site_name"],
  ["property", "og:image"],
  ["property", "og:image:type"],
  ["property", "og:image:width"],
  ["property", "og:image:height"],
  ["property", "og:image:alt"],
  ["name", "twitter:card"],
  ["name", "twitter:image"],
  ["name", "twitter:image:alt"],
];

const pages = walk(dist, ".html").filter((path) => path.endsWith("index.html"));
for (const path of pages) {
  const html = readFileSync(path, "utf8");
  for (const [attr, value] of requiredMeta) {
    const pattern = new RegExp(`<meta\\s+${attr}="${value}"\\s+content="[^"]+"`);
    if (!pattern.test(html)) fail(`${path}: ${value} 누락`);
  }
  if (!/<link rel="canonical" href="https:\/\/carboxsize\.m1k\.app\/[^"]*" \/>/.test(html)) {
    fail(`${path}: canonical 누락`);
  }
  if (!html.includes('content="index, follow, max-image-preview:large"')) {
    fail(`${path}: 큰 이미지 미리보기 허용 누락`);
  }

  const ogUrl = /<meta property="og:url" content="([^"]+)"/.exec(html)?.[1];
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  if (ogUrl !== canonical) fail(`${path}: og:url과 canonical 불일치`);

  const imageUrl = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
  const imagePath = resolve(dist, decodeURIComponent(new URL(imageUrl).pathname).replace(/^\//, ""));
  if (!existsSync(imagePath)) fail(`${path}: OG 이미지 파일 없음 (${imageUrl})`);

  const isComparison = path.includes(`${resolve(dist, "compare")}/`);
  if (isComparison && html.includes('"@type":"FAQPage"')) {
    fail(`${path}: 본문에 없는 홈페이지 FAQ 구조화 데이터가 남음`);
  }
  if (isComparison && !html.includes('"primaryImageOfPage"')) {
    fail(`${path}: 비교 이미지 구조화 데이터 누락`);
  }
}

const sitemap = readFileSync(resolve(dist, "sitemap.xml"), "utf8");
const sitemapImages = (sitemap.match(/<image:image>/g) ?? []).length;
if (sitemapImages !== ogImages.length) {
  fail(`sitemap 이미지 ${sitemapImages}개, OG 이미지 ${ogImages.length}개`);
}

console.log(`✓ SEO 검증: HTML ${pages.length}개 · OG ${ogImages.length}장 · 1200×630 · 메타/이미지 sitemap 일치`);
