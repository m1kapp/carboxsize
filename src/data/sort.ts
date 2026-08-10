import { boxVolume, spaceVolume, type Car } from "./cars";
import { LATEST_MONTH, salesOf } from "./sales";

export type SortKey = "sales" | "spaceVolume" | "boxVolume" | "xInSize" | "xSize" | "zSize" | "ySize";
export type SortDir = "asc" | "desc";

export const SORT_LABELS: Record<SortKey, string> = {
  sales: "판매",
  spaceVolume: "공간",
  boxVolume: "외형",
  xInSize: "축거",
  xSize: "전장",
  zSize: "전고",
  ySize: "전폭",
};

export const SORT_KEYS = Object.keys(SORT_LABELS) as SortKey[];

/** SORT_KEYS 와 같은 순서 — 앞 기준이 동점이면 뒤 기준으로 이어서 가른다 */
const comparators = (month: string): Record<SortKey, (a: Car, b: Car) => number> => ({
  sales: (a, b) => (salesOf(a.no, month) ?? 0) - (salesOf(b.no, month) ?? 0),
  spaceVolume: (a, b) => spaceVolume(a) - spaceVolume(b),
  boxVolume: (a, b) => boxVolume(a) - boxVolume(b),
  xInSize: (a, b) => a.xInSize - b.xInSize,
  xSize: (a, b) => a.xSize - b.xSize,
  zSize: (a, b) => a.zSize - b.zSize,
  ySize: (a, b) => a.ySize - b.ySize,
});

/** 해당 기준으로 잴 수 없는 항목(치수 0)은 목록에서 뺀다 — 축거 없는 "주차장" 등 */
function measurable(car: Car, key: SortKey, month: string): boolean {
  switch (key) {
    case "sales":
      return salesOf(car.no, month) != null;
    case "spaceVolume":
      return car.xInSize > 0 && car.ySize > 0 && car.zSize > 0;
    case "boxVolume":
      return car.xSize > 0 && car.ySize > 0 && car.zSize > 0;
    default:
      return car[key] > 0;
  }
}

export function sortCars(cars: Car[], key: SortKey, dir: SortDir, month: string = LATEST_MONTH): Car[] {
  const compare = comparators(month);
  const tieBreakers = SORT_KEYS.slice(SORT_KEYS.indexOf(key)).map((k) => compare[k]);

  return cars
    .filter((car) => measurable(car, key, month))
    .sort((a, b) => {
      for (const tieBreak of tieBreakers) {
        const diff = tieBreak(a, b);
        if (diff !== 0) return dir === "asc" ? diff : -diff;
      }
      return 0;
    });
}
