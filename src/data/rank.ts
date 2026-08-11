import { boxVolume, CARS, spaceVolume, type Car } from "./cars";
import { LATEST_MONTH, salesOf } from "./sales";

/** 기준자(성인사람·주차장)는 차가 아니라 눈금이라 순위 계산에서 뺀다. */
export const isRuler = (car: Car) => !car.brand;

const REAL_CARS = CARS.filter((c) => !isRuler(c));

/** 큰 값이 1위. 동점이면 같은 등수. */
const rankDesc = (values: number[], value: number) => values.filter((v) => v > value).length + 1;

const SPACE = REAL_CARS.map(spaceVolume);
const BOX = REAL_CARS.map(boxVolume);

export type Chip = { label: string; tone: "top" | "bottom" | "sales" };

export const CHIP_TONE: Record<Chip["tone"], string> = {
  top: "bg-blue-600/90",
  bottom: "bg-zinc-500/90",
  sales: "bg-gradient-to-r from-blue-600 to-purple-600",
};

/** 상위/하위 10% 안쪽일 때만 칩을 준다. 가운데 80%는 굳이 라벨을 안 붙인다. */
function edgeChip(values: number[], value: number, name: string): Chip | null {
  const percentile = (rankDesc(values, value) / values.length) * 100;
  if (percentile <= 10) return { label: `${name} 상위 10%`, tone: "top" };
  if (percentile >= 90) return { label: `${name} 하위 10%`, tone: "bottom" };
  return null;
}

/**
 * 카드에 붙일 칩. 카드가 좁아서 최대 2개 — 판매 순위를 먼저 두고,
 * 그 다음 코어, 코어가 평범하면 외형으로 자리를 채운다.
 */
export function chipsFor(car: Car, month: string = LATEST_MONTH): Chip[] {
  if (isRuler(car)) return [];

  const chips: Chip[] = [];

  const units = salesOf(car.no, month);
  if (units != null) {
    const all = REAL_CARS.map((c) => salesOf(c.no, month)).filter((v): v is number => v != null);
    const rank = rankDesc(all, units);
    if (rank <= 10) chips.push({ label: `판매 ${rank}위`, tone: "sales" });
  }

  const chip = edgeChip(SPACE, spaceVolume(car), "코어") ?? edgeChip(BOX, boxVolume(car), "외형");
  if (chip) chips.push(chip);

  return chips.slice(0, 2);
}
