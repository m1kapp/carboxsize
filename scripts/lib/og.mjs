import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { boxFaces } from "./box3d.mjs";

const here = dirname(fileURLToPath(import.meta.url));
// 파일명 대소문자를 실제 파일과 맞춘다. macOS 는 무시하지만 빌드 서버(Linux)는 구분해서,
// 못 찾으면 loadSystemFonts:false 와 겹쳐 글자가 통째로 사라진다(실제로 그랬다).
const fontFiles = ["Pretendard-regular.otf", "Pretendard-bold.otf"].map((f) =>
  resolve(here, "../fonts", f),
);
for (const file of fontFiles) {
  if (!existsSync(file)) throw new Error(`폰트가 없습니다: ${file}`);
}

const W = 1200;
const H = 630;
/** 목록 썸네일 — OG 원본의 절반. 16장 깔아도 가볍게 */
export const THUMB_WIDTH = 600;

/** 다나와 차 사진을 dataURI 로. 빌드마다 100장을 다시 받지 않도록 캐시한다. */
const cacheDir = resolve(here, "../.cache");
export async function carPhoto(no) {
  if (!no) return null;
  const file = resolve(cacheDir, `${no}.png`);
  if (!existsSync(file)) {
    mkdirSync(cacheDir, { recursive: true });
    const res = await fetch(`https://autoimg.danawa.com/photo/${no}/model_360.png`);
    if (!res.ok) return null;
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return `data:image/png;base64,${readFileSync(file).toString("base64")}`;
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const m3 = (a, b, c) => Math.round((a * b * c * 100) / 1e9) / 100;

/**
 * 앱 카드 한 장을 그대로 그린다 — 회색 스테이지에 사진+3D 상자, 아래 제원 6칸.
 *
 * 공유 카드가 앱과 다른 그림이면 눌러 들어왔을 때 "아까 그거"로 안 이어진다.
 * 그래서 화면에 있는 구성을 그대로 옮긴다.
 *
 * satori 를 안 쓰고 SVG 를 직접 쓰는 이유도 이것이다. satori 는 CSS transform 을 그리지
 * 않아서 상자가 납작한 사각형이 된다. 여기서는 회전을 직접 계산해 육면체를 낸다.
 */
function carCard(car, { x, y, width, scale }) {
  const stageH = Math.round(width * 0.78);
  const titleH = 46;
  const height = titleH + stageH;

  const box = boxFaces({ length: car.xSize, width: car.ySize, height: car.zSize }, scale);
  const cx = x + width / 2;
  const cy = y + titleH + stageH / 2;
  const photoWidth = car.xSize * scale;

  const photo = car.photo
    ? `<image href="${car.photo}" x="${(cx - photoWidth / 2).toFixed(1)}" y="${(cy - box.height / 2).toFixed(1)}" width="${photoWidth.toFixed(1)}" height="${box.height.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`
    : "";

  const faces = box.faces
    .map(
      (f) =>
        `<polygon points="${f.points}" fill="rgba(0,0,0,0.055)" stroke="rgba(0,0,0,0.45)" stroke-width="1.5" stroke-linejoin="round"/>`,
    )
    .join("");

  return `<g>
<clipPath id="stage-${car.clipId}"><rect x="${x}" y="${y + titleH}" width="${width}" height="${stageH}"/></clipPath>
<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#fff"/>
<text x="${x + 14}" y="${y + 29}" font-size="21" font-weight="700" fill="#27272a">${esc(car.label)}</text>
<rect x="${x}" y="${y + titleH}" width="${width}" height="${stageH}" fill="url(#stage)" clip-path="url(#stage-${car.clipId})"/>
<g clip-path="url(#stage-${car.clipId})">
  ${photo}
  <g transform="translate(${(cx - box.width / 2).toFixed(1)},${(cy - box.height / 2).toFixed(1)})">${faces}</g>
</g>
</g>`;
}

export async function renderOg({ title, subtitle, headline, cars, footer, width = W }) {
  const cardW = cars.length > 1 ? 340 : 460;
  const gap = 28;
  const startX = 64;
  const cardY = 196;

  // 두 카드가 같은 자를 써야 크기 비교가 성립한다 — 큰 차 기준으로 배율을 정한다
  const maxLen = Math.max(...cars.map((c) => c.xSize));
  const maxHeight = Math.max(...cars.map((c) => c.zSize + c.ySize * 0.6));
  const scale = Math.min((cardW - 36) / maxLen, (cardW * 0.78 - 34) / maxHeight);

  const groups = cars
    .map((car, i) =>
      carCard({ ...car, clipId: i }, { x: startX + i * (cardW + gap), y: cardY, width: cardW, scale }),
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#7c3aed"/>
  </linearGradient>
  <linearGradient id="stage" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e4e4e7"/><stop offset="1" stop-color="#71717a"/>
  </linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<text x="64" y="118" font-size="${cars.length > 1 ? 62 : 74}" font-weight="700" fill="#fff" letter-spacing="-2">${esc(title)}</text>
<text x="64" y="164" font-size="26" fill="rgba(255,255,255,0.82)">${esc(subtitle)}</text>
${groups}
${
  headline
    ? `<text x="${W - 64}" y="${H - 150}" text-anchor="end" font-size="54" font-weight="700" fill="#fff" letter-spacing="-1">${esc(headline.value)}</text>
<text x="${W - 64}" y="${H - 116}" text-anchor="end" font-size="22" fill="rgba(255,255,255,0.8)">${esc(headline.label)}</text>`
    : ""
}
<text x="64" y="${H - 44}" font-size="22" fill="rgba(255,255,255,0.75)">${esc(footer)}</text>
<text x="${W - 64}" y="${H - 44}" text-anchor="end" font-size="22" font-weight="700" fill="rgba(255,255,255,0.9)">carboxsize.m1k.app</text>
</svg>`;

  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Pretendard" },
  })
    .render()
    .asPng();
}
