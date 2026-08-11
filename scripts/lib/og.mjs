import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const here = dirname(fileURLToPath(import.meta.url));
const fonts = [
  { name: "Pretendard", weight: 400, style: "normal", data: readFileSync(resolve(here, "../fonts/Pretendard-regular.otf")) },
  { name: "Pretendard", weight: 800, style: "normal", data: readFileSync(resolve(here, "../fonts/Pretendard-bold.otf")) },
];

const BLUE = "#2563eb";
const PURPLE = "#7c3aed";
const STAGE = { width: 1072, height: 250 };

/** 목록 썸네일 — OG 원본(1200)의 절반. 16장 깔아도 가볍게 */
export const THUMB_WIDTH = 600;

const el = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.length > 1 ? children : children[0] },
});
const text = (value, style) => el("div", style, value);

/**
 * 차 옆모습 — 몸체 상자에 바퀴 두 개.
 *
 * satori는 transform을 안 그리므로 앱의 3D 상자를 그대로 옮길 수 없다. 대신 옆에서 본
 * 모습으로 단순화하고, 바퀴를 축거 위치에 놓아 "바퀴 사이가 코어"라는 뜻을 남긴다.
 * 치수는 실제 비율 그대로라 두 차를 겹쳐 놓으면 크기 차이가 그대로 보인다.
 */
function carShape(car, scale, { fill, border }) {
  const w = car.xSize * scale;
  const h = car.zSize * scale;
  const wheel = Math.max(26, h * 0.3);
  // 오버행이 앞뒤로 균등하다고 보고 축거를 가운데 놓는다 — 정확한 바퀴 위치는 데이터에 없다
  const inset = (w - car.xInSize * scale) / 2;

  return el("div", { position: "relative", width: w, height: h + wheel / 2 },
    el("div", {
      position: "absolute", left: 0, bottom: wheel / 2, width: w, height: h,
      backgroundColor: fill, border: `3px solid ${border}`, borderRadius: 14,
    }),
    ...[inset - wheel / 2, w - inset - wheel / 2].map((x, i) =>
      el("div", {
        position: "absolute", left: x, bottom: 0, width: wheel, height: wheel,
        borderRadius: wheel, backgroundColor: border, key: String(i),
      }),
    ),
  );
}

export async function renderOg({ title, subtitle, headline, cars, footer, width = 1200 }) {
  // 두 차를 같은 자로 그린다 — 이미지 안에서 크기 차이가 그대로 보이게
  const maxLen = Math.max(...cars.map((c) => c.xSize));
  const maxHeight = Math.max(...cars.map((c) => c.zSize));
  const totalLen = cars.reduce((sum, c) => sum + c.xSize, 0);
  const scale = Math.min((STAGE.width * 0.62) / totalLen, (STAGE.height * 0.72) / maxHeight);

  // 겹쳐 그리면 전장 차이가 15mm쯤인 조합(쏘렌토·싼타페)은 한 대로 보인다.
  // 나란히 두되 같은 자로 그려서, 차이가 작으면 작은 대로 보이게 한다.

  const tree = el("div", {
    width: 1200, height: 630, flexDirection: "column", justifyContent: "space-between",
    padding: 64, backgroundColor: "#0b1220",
    backgroundImage: `linear-gradient(135deg, ${BLUE} 0%, ${PURPLE} 100%)`,
    fontFamily: "Pretendard", color: "#fff",
  },
    el("div", { flexDirection: "column", gap: 6 },
      text(title, { fontSize: cars.length > 1 ? 64 : 76, fontWeight: 800, letterSpacing: -2 }),
      text(subtitle, { fontSize: 26, opacity: 0.82 }),
    ),

    el("div", { width: STAGE.width, height: STAGE.height, alignItems: "flex-end", justifyContent: "space-between" },
      el("div", { alignItems: "flex-end", gap: 44 },
        ...cars.map((car) =>
          el("div", { flexDirection: "column", alignItems: "flex-start", gap: 10 },
            carShape(car, scale, { fill: "rgba(255,255,255,0.22)", border: "#ffffff" }),
            text(car.label, { fontSize: 24, fontWeight: 800 }),
          ),
        ),
      ),
      headline
        ? el("div", { flexDirection: "column", alignItems: "flex-end", gap: 4, paddingBottom: 10 },
            text(headline.value, { fontSize: 52, fontWeight: 800, letterSpacing: -1 }),
            text(headline.label, { fontSize: 22, opacity: 0.8 }),
          )
        : el("div", {}),
    ),

    el("div", { justifyContent: "space-between", alignItems: "center" },
      text(footer, { fontSize: 22, opacity: 0.75 }),
      text("carboxsize.m1k.app", { fontSize: 22, fontWeight: 800, opacity: 0.9 }),
    ),
  );

  // 항상 1200×630으로 그린 뒤 원하는 폭으로 굽는다 — 레이아웃 계산을 한 벌만 유지한다
  const svg = await satori(tree, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
}
