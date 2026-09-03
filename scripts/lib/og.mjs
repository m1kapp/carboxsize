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

/**
 * 같은 축척의 차 사진+3D 상자를 하나의 비교 스테이지에 그린다.
 *
 * 공유 썸네일은 실제 1200px 원본보다 훨씬 작게 보인다. 차마다 별도 카드 테두리를 두면
 * 사진이 이중으로 축소되므로, 한 스테이지 안에서 차를 최대한 크게 보여준다.
 *
 * satori 를 안 쓰고 SVG 를 직접 쓰는 이유도 이것이다. satori 는 CSS transform 을 그리지
 * 않아서 상자가 납작한 사각형이 된다. 여기서는 회전을 직접 계산해 육면체를 낸다.
 */
function carVisual(car, { x, y, width, height, scale }) {
  const box = boxFaces({ length: car.xSize, width: car.ySize, height: car.zSize }, scale);
  const cx = x + width / 2;
  const cy = y + height / 2;
  const photoWidth = car.xSize * scale;

  const photo = car.photo
    ? `<image href="${car.photo}" x="${(cx - photoWidth / 2).toFixed(1)}" y="${(cy - box.height / 2).toFixed(1)}" width="${photoWidth.toFixed(1)}" height="${box.height.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`
    : "";

  // 뒤쪽 면은 흐리게, 앞쪽 면은 진하게. 여섯 면을 같은 굵기로 그리면 뒤 모서리가 차를
  // 가로질러 X 자처럼 보인다. 가려지는 선을 죽여야 상자로 읽힌다.
  const faces = box.faces
    .map((f, i) => {
      const front = i >= box.faces.length / 2;
      const stroke = front ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.16)";
      return `<polygon points="${f.points}" fill="rgba(0,0,0,0.04)" stroke="${stroke}" stroke-width="${front ? 1.6 : 1.2}" stroke-linejoin="round"/>`;
    })
    .join("");

  return `<g>
<clipPath id="car-${car.clipId}"><rect x="${x}" y="${y}" width="${width}" height="${height}"/></clipPath>
<g clip-path="url(#car-${car.clipId})">
  ${photo}
  <g transform="translate(${(cx - box.width / 2).toFixed(1)},${(cy - box.height / 2).toFixed(1)})">${faces}</g>
</g>
</g>`;
}

const shortLabel = (label) => String(label ?? "").split(" (")[0];

/** 한글·영문이 섞인 제목이 1,072px 안전영역을 넘지 않게 글자 크기를 줄인다. */
function fittedFontSize(text, preferred, min, maxWidth) {
  const units = [...String(text)].reduce((sum, ch) => {
    if (/\s/.test(ch)) return sum + 0.35;
    if (/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/.test(ch)) return sum + 1;
    if (/[A-Z0-9]/.test(ch)) return sum + 0.68;
    return sum + 0.56;
  }, 0);
  return Math.max(min, Math.min(preferred, Math.floor(maxWidth / Math.max(units, 1))));
}

export async function renderOg({ title, subtitle, headline, cars, footer, highlight, width = W }) {
  const safeX = 64;
  const safeW = W - safeX * 2;
  const stageY = 198;
  const stageH = 300;
  const visualY = stageY + 14;
  const visualH = 226;
  const titleSize = fittedFontSize(title, cars.length > 1 ? 58 : 62, 36, safeW);
  const subtitleSize = fittedFontSize(subtitle, 25, 19, safeW);
  const headlineSize = headline ? fittedFontSize(headline.value, 43, 30, 560) : 43;

  const gap = cars.length > 1 ? 72 : 0;
  const visualW = cars.length > 1 ? (safeW - gap) / 2 : 640;
  const visualStartX = cars.length > 1 ? safeX : (W - visualW) / 2;

  // 두 카드가 같은 자를 써야 크기 비교가 성립한다 — 큰 차 기준으로 배율을 정한다
  const maxLen = Math.max(...cars.map((c) => c.xSize));
  const maxHeight = Math.max(...cars.map((c) => c.zSize + c.ySize * 0.6));
  const scale = Math.min((visualW - 38) / maxLen, (visualH - 22) / maxHeight);

  const groups = cars
    .map((car, i) =>
      carVisual(
        { ...car, clipId: i },
        { x: visualStartX + i * (visualW + gap), y: visualY, width: visualW, height: visualH, scale },
      ),
    )
    .join("");

  const labels = cars
    .map((car, i) => {
      const cx = visualStartX + i * (visualW + gap) + visualW / 2;
      const name = shortLabel(car.label);
      const emphasized = name === highlight;
      return `<text x="${cx}" y="${stageY + 276}" text-anchor="middle" font-size="${emphasized ? 31 : 25}" font-weight="${emphasized ? 700 : 600}" fill="${emphasized ? "#4f46e5" : "#52525b"}">${esc(name)}</text>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#7c3aed"/>
  </linearGradient>
  <linearGradient id="stage" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#cbd5e1"/>
  </linearGradient>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#172554" flood-opacity="0.18"/>
  </filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<text x="${safeX}" y="44" font-size="17" font-weight="700" fill="rgba(255,255,255,0.72)" letter-spacing="2.2">CAR BOX SIZE · 자동차 크기 비교</text>
<text x="${safeX}" y="111" font-size="${titleSize}" font-weight="700" fill="#fff" letter-spacing="-1.8">${esc(title)}</text>
<text x="${safeX}" y="160" font-size="${subtitleSize}" fill="rgba(255,255,255,0.84)">${esc(subtitle)}</text>
<rect x="${safeX}" y="${stageY}" width="${safeW}" height="${stageH}" rx="30" fill="url(#stage)" filter="url(#shadow)"/>
<path d="M ${safeX + 24} ${stageY + 240} H ${W - safeX - 24}" stroke="rgba(15,23,42,0.1)"/>
${groups}
${labels}
${
  cars.length > 1
    ? (() => {
        const cx = W / 2;
        const cy = stageY + 118;
        return `<path d="M ${cx} ${stageY + 28} V ${stageY + stageH - 72}" stroke="rgba(15,23,42,0.12)"/>
<circle cx="${cx}" cy="${cy}" r="31" fill="#fff" stroke="rgba(15,23,42,0.08)" stroke-width="2"/>
<text x="${cx}" y="${cy + 9}" text-anchor="middle" font-size="23" font-weight="700" fill="#3f3f46">VS</text>`;
      })()
    : ""
}
${
  headline
    ? `<text x="${W - safeX}" y="${H - 74}" text-anchor="end" font-size="${headlineSize}" font-weight="700" fill="#fff" letter-spacing="-1">${esc(headline.value)}</text>
${headline.cta ? `<rect x="${W - safeX - 396}" y="${H - 62}" width="396" height="36" rx="18" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.2)"/>` : ""}
<text x="${W - safeX - (headline.cta ? 18 : 0)}" y="${H - 38}" text-anchor="end" font-size="${headline.cta ? 20 : 19}" font-weight="${headline.cta ? 700 : 400}" fill="rgba(255,255,255,0.9)">${esc(headline.label)}</text>`
    : ""
}
<text x="${safeX}" y="${H - 67}" font-size="20" fill="rgba(255,255,255,0.78)">${esc(footer)}</text>
<text x="${safeX}" y="${H - 38}" font-size="18" font-weight="700" fill="rgba(255,255,255,0.92)">carboxsize.m1k.app</text>
</svg>`;

  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Pretendard" },
  })
    .render()
    .asPng();
}
