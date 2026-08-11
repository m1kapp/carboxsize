import { Img } from "@m1kapp/kit";
import { boxVolume, carImageUrl, spaceVolume, type Car } from "../data/cars";
import { PAIRS } from "../data/pairs";

const shortName = (car: Car) => car.name.split(" (")[0];

/**
 * 자주 비교하는 조합 — 비교 화면 아래에 깔리는 목록.
 *
 * 비교 화면에 처음 오면 뭘 골라야 할지 막막하다. 검색창을 두 번 여는 대신
 * 남들이 실제로 저울질하는 조합을 눌러서 시작할 수 있게 한다.
 *
 * 카드를 화면 너비로 쓰는 이유: 작게 넣으면 차 사진이 안 보이고, 안 보이면 누를 이유가 없다.
 * 목록은 SEO 비교 페이지와 같은 것을 쓴다(src/data/pairs.ts).
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
    <div className="flex flex-col gap-2">
      {shown.map(([a, b]) => {
        const active =
          (current[0] === a.name && current[1] === b.name) ||
          (current[0] === b.name && current[1] === a.name);

        const diff = spaceVolume(a) - spaceVolume(b);
        const bigger = diff >= 0 ? a : b;

        return (
          <button
            key={`${a.name}|${b.name}`}
            onClick={() => onPick([a, b])}
            className={`w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 transition-all active:scale-[0.99] ${
              active ? "ring-2 ring-blue-500" : "ring-black/5 hover:shadow-md"
            }`}
          >
            {/* 두 차를 좌우로 크게 두고 가운데 VS — 뭘 비교하는 카드인지 한눈에 */}
            <div className="relative flex h-[104px] items-center bg-gradient-to-br from-gray-100 to-gray-300">
              {[a, b].map((car) => {
                const image = carImageUrl(car.no);
                return (
                  <span key={car.name} className="flex h-full flex-1 items-center justify-center overflow-hidden px-2">
                    {image && <Img candidates={[image]} alt="" className="max-h-[86px] object-contain" />}
                  </span>
                );
              })}

              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-black tracking-tight text-gray-500 shadow-sm">
                VS
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-gray-800">
                  {shortName(a)} <span className="text-[10px] font-normal text-gray-300">vs</span>{" "}
                  {shortName(b)}
                </p>
                <p className="mt-0.5 truncate text-[10px] tabular-nums text-gray-400">
                  {a.segment ?? ""} · 외형 {boxVolume(a)} vs {boxVolume(b)}m³
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[13px] font-black tabular-nums text-blue-600">
                  {Math.abs(diff) < 0.01 ? "≈" : `+${Math.abs(diff).toFixed(2)}`}
                </p>
                <p className="text-[9px] text-gray-400">
                  {Math.abs(diff) < 0.01 ? "코어 같음" : `${shortName(bigger)} 코어`}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
