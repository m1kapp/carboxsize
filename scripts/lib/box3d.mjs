/**
 * 앱 카드의 3D 상자를 SVG로 다시 그린다.
 *
 * satori 는 CSS transform 을 그리지 않아서 상자가 납작한 사각형이 된다. 그래서 회전을
 * 직접 계산해 육면체 여섯 면을 polygon 으로 낸다. 회전각은 앱과 같은 값(rotateX 8°,
 * rotateY 128°)을 쓰므로 화면에서 보던 각도가 그대로 나온다.
 *
 * CSS 의 `rotateX(a) rotateY(b)` 는 Rx·Ry 순서라 점에는 Ry 를 먼저 적용한다.
 * 원근 없이 정사영으로 두는 것도 앱과 같다(perspective 를 안 준다).
 */
const rad = (deg) => (deg * Math.PI) / 180;

export const ROTATION = { x: 8, y: 128 };

function project([x, y, z], { x: ax, y: ay } = ROTATION) {
  // CSS 는 y 축이 아래를 향하는 좌표계다. 여기서는 y 를 위로 두고 계산한 뒤 뒤집으므로
  // 회전 부호를 반대로 넣어야 화면과 같은 방향이 된다(안 그러면 상자가 좌우로 뒤집힌다).
  const [sy, cy] = [Math.sin(rad(-ay)), Math.cos(rad(-ay))];
  const [sx, cx] = [Math.sin(rad(-ax)), Math.cos(rad(-ax))];

  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;

  const y2 = y * cx - z1 * sx;
  const z2 = y * sx + z1 * cx;

  // SVG 는 y 가 아래로 자라므로 뒤집는다
  return { x: x1, y: -y2, depth: z2 };
}

/**
 * @param size {{ length:number, width:number, height:number }} mm 단위 실제 치수
 * @returns {{ faces: {points:string, depth:number}[], width:number, height:number }}
 */
export function boxFaces(size, scale) {
  const [w, h, d] = [size.length * scale, size.height * scale, size.width * scale];
  const [hx, hy, hz] = [w / 2, h / 2, d / 2];

  const corner = (sx, sy, sz) => project([sx * hx, sy * hy, sz * hz]);
  const v = {
    // 앞(z+) 뒤(z-) × 위아래 × 좌우
    ftl: corner(-1, 1, 1), ftr: corner(1, 1, 1), fbr: corner(1, -1, 1), fbl: corner(-1, -1, 1),
    btl: corner(-1, 1, -1), btr: corner(1, 1, -1), bbr: corner(1, -1, -1), bbl: corner(-1, -1, -1),
  };

  const quads = [
    [v.ftl, v.ftr, v.fbr, v.fbl], // 앞
    [v.btl, v.btr, v.bbr, v.bbl], // 뒤
    [v.ftl, v.ftr, v.btr, v.btl], // 위
    [v.fbl, v.fbr, v.bbr, v.bbl], // 아래
    [v.ftl, v.fbl, v.bbl, v.btl], // 좌
    [v.ftr, v.fbr, v.bbr, v.btr], // 우
  ];

  const all = Object.values(v);
  const minX = Math.min(...all.map((p) => p.x));
  const minY = Math.min(...all.map((p) => p.y));

  return {
    // 뒤에 있는 면부터 그린다 — 겹칠 때 앞면이 위로 오게(화가 알고리즘)
    faces: quads
      .map((quad) => ({
        points: quad.map((p) => `${(p.x - minX).toFixed(1)},${(p.y - minY).toFixed(1)}`).join(" "),
        depth: quad.reduce((sum, p) => sum + p.depth, 0) / 4,
      }))
      .sort((a, b) => a.depth - b.depth),
    width: Math.max(...all.map((p) => p.x)) - minX,
    height: Math.max(...all.map((p) => p.y)) - minY,
  };
}
