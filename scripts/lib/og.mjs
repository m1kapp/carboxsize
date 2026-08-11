import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { boxFaces } from "./box3d.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fontFiles = ["Pretendard-Regular.otf", "Pretendard-Bold.otf"].map((f) =>
  resolve(here, "../fonts", f),
);

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
 * 차 한 대 — 사진 위에 3D 상자를 겹친다. 앱 카드와 같은 그림이다.
 *
 * satori 를 안 쓰고 SVG 를 직접 쓰는 이유가 이것이다. satori 는 CSS transform 을 그리지
 * 않아서 상자가 납작한 사각형이 된다. 여기서는 회전을 직접 계산해 육면체를 낸다.
 */
function carGroup(car, scale, centerX, baseline) {
  const box = boxFaces({ length: car.xSize, width: car.ySize, height: car.zSize }, scale);
  const left = centerX - box.width / 2;
  const top = baseline - box.height;
  const photoWidth = car.xSize * scale;

  const photo = car.photo
    ? `<image href="${car.photo}" x="${(centerX - photoWidth / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${photoWidth.toFixed(1)}" height="${box.height.toFixed(1)}" preserveAspectRatio="xMidYMid meet"/>`
    : "";

  const faces = box.faces
    .map(
      (f) =>
        `<polygon points="${f.points}" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.85)" stroke-width="2" stroke-linejoin="round"/>`,
    )
    .join("");

  return `${photo}<g transform="translate(${left.toFixed(1)},${top.toFixed(1)})">${faces}</g>
<text x="${centerX.toFixed(1)}" y="${(baseline + 36).toFixed(1)}" text-anchor="middle" font-size="26" font-weight="700" fill="#fff">${esc(car.label)}</text>`;
}

export async function renderOg({ title, subtitle, headline, cars, footer, width = W }) {
  const stage = { top: 240, bottom: 500, width: 660 };
  const totalLen = cars.reduce((sum, c) => sum + c.xSize, 0);
  // 상자는 기울어져 있어 전고보다 높이 솟는다 — 전폭 성분을 더해 잘리지 않게 잡는다
  const maxHeight = Math.max(...cars.map((c) => c.zSize + c.ySize * 0.6));
  const scale = Math.min(stage.width / (totalLen * 1.3), (stage.bottom - stage.top) / maxHeight);

  let cursor = 76;
  const groups = cars
    .map((car) => {
      const span = car.xSize * scale * 1.25;
      const svg = carGroup(car, scale, cursor + span / 2, stage.bottom);
      cursor += span + 44;
      return svg;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#7c3aed"/>
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
