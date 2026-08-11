import type { Car } from "./cars";

/**
 * 기계식 주차장 판정 — 주차장법 시행규칙 제16조의2.
 *
 * 도심에서 차를 고를 때 실제로 걸리는 벽이다. 치수만이 아니라 무게로도 막히고,
 * 배터리를 얹은 전기차가 여기서 자주 걸린다.
 */
export const MECHANICAL_LIMITS = {
  중형: { length: 5200, width: 2000, height: 1850, weight: 2350 },
  대형: { length: 5750, width: 2150, height: 1850, weight: 2650 },
} as const;

export type ParkingSize = keyof typeof MECHANICAL_LIMITS;

export type ParkingCheck = {
  /** 들어갈 수 있는 가장 작은 규격. 둘 다 안 되면 null */
  fits: ParkingSize | null;
  /** 중형에서 걸린 항목 — "높이 1,990" 형태 */
  blockedBy: string[];
  /** 공차중량을 모르는 차는 무게 판정을 건너뛴다 */
  weightUnknown: boolean;
};

const LABELS = { length: "길이", width: "너비", height: "높이", weight: "무게" } as const;

function violations(car: Car, limit: (typeof MECHANICAL_LIMITS)[ParkingSize]) {
  const checks: [keyof typeof LABELS, number, number][] = [
    ["length", car.xSize, limit.length],
    ["width", car.ySize, limit.width],
    ["height", car.zSize, limit.height],
  ];
  // 무게를 모르면 없는 셈 치고 넘어간다 — 모른다는 이유로 못 들어간다고 하면 안 된다
  if (car.weight != null) checks.push(["weight", car.weight, limit.weight]);

  return checks
    .filter(([, value, max]) => value > max)
    .map(([key, value]) => `${LABELS[key]} ${value.toLocaleString()}${key === "weight" ? "kg" : ""}`);
}

export function checkParking(car: Car): ParkingCheck | null {
  if (!car.brand) return null; // 기준자(성인사람·주차장)는 판정 대상이 아니다

  const mid = violations(car, MECHANICAL_LIMITS.중형);
  if (!mid.length) return { fits: "중형", blockedBy: [], weightUnknown: car.weight == null };

  const big = violations(car, MECHANICAL_LIMITS.대형);
  return {
    fits: big.length ? null : "대형",
    blockedBy: mid,
    weightUnknown: car.weight == null,
  };
}
