import type { Car } from "../data/cars";
import { PAIRS } from "../data/pairs";

const shortName = (car: Car) => car.name.split(" (")[0];
const slug = (car: Car) => shortName(car).replace(/\s+/g, "");

/**
 * 자주 비교하는 조합 — 비교 화면 아래 목록.
 *
 * 썸네일은 공유될 때 뜨는 OG 이미지와 같은 그림이다(scripts/gen-thumbs.mjs 가 절반 크기로
 * 굽는다). 목록에서 본 그림이 공유 카드에도 그대로 뜨면 "아까 그거"로 이어진다.
 *
 * 이미지 안에 제목·수치가 이미 들어 있어서 아래 캡션은 최소로 둔다.
 * 한 장에 63KB라 lazy 로 걸어 화면에 들어올 때만 받는다.
 */
export function PairShortcuts({
  current,
  onPick,
  limit = 16,
}: {
  current: [string | null, string | null];
  onPick: (pair: [Car, Car]) => void;
  limit?: number;
}) {
  const shown = PAIRS.slice(0, limit);
  if (!shown.length) return null;

  return (
    <div className="flex flex-col gap-3">
      {shown.map(([a, b]) => {
        const active =
          (current[0] === a.name && current[1] === b.name) ||
          (current[0] === b.name && current[1] === a.name);

        return (
          <button
            key={`${a.name}|${b.name}`}
            onClick={() => onPick([a, b])}
            className={`w-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-all active:scale-[0.99] ${
              active ? "ring-2 ring-blue-500" : "ring-black/5 hover:shadow-md"
            }`}
          >
            <img
              src={`/og/${encodeURIComponent(`${slug(a)}-vs-${slug(b)}`)}.png`}
              alt={`${shortName(a)} vs ${shortName(b)} 크기 비교`}
              loading="lazy"
              width={600}
              height={315}
              className="block w-full"
            />
          </button>
        );
      })}
    </div>
  );
}
