import { Img } from "@m1kapp/kit";
import { carImageUrl, spaceVolume, type Car } from "../data/cars";
import { PAIRS } from "../data/pairs";

const name = (car: Car) => car.name.split(" (")[0];

/**
 * 자주 비교하는 조합 — 랜덤 버튼 아래 바로가기.
 *
 * 비교 화면에 처음 오면 뭘 골라야 할지 막막하다. 검색창을 두 번 여는 대신
 * 남들이 실제로 저울질하는 조합을 눌러서 시작할 수 있게 한다.
 * 목록은 SEO용 비교 페이지와 같은 것을 쓴다(src/data/pairs.ts).
 */
export function PairShortcuts({
  current,
  onPick,
  limit = 12,
}: {
  current: [string | null, string | null];
  onPick: (pair: [Car, Car]) => void;
  limit?: number;
}) {
  const shown = PAIRS.slice(0, limit);
  if (!shown.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-[11px] text-gray-400">자주 비교하는 조합</p>

      <div className="grid grid-cols-2 gap-2">
        {shown.map(([a, b]) => {
          const active =
            (current[0] === a.name && current[1] === b.name) ||
            (current[0] === b.name && current[1] === a.name);
          const diff = Math.abs(spaceVolume(a) - spaceVolume(b));

          return (
            <button
              key={`${a.name}|${b.name}`}
              onClick={() => onPick([a, b])}
              className={`flex items-center gap-1.5 rounded-xl bg-white p-2 text-left shadow-sm ring-1 transition-all active:scale-[0.98] ${
                active ? "ring-blue-500" : "ring-black/5 hover:bg-gray-50"
              }`}
            >
              {/* 동그라미에 차 사진을 욱여넣으면 어둡게 뭉쳐서 뭐가 뭔지 안 보인다.
                  가로로 넓은 칸에 사진을 통째로 담는다. */}
              <div className="flex shrink-0 items-center gap-0.5">
                {[a, b].map((car) => {
                  const image = carImageUrl(car.no);
                  return (
                    <span
                      key={car.name}
                      className="flex h-6 w-9 items-center justify-center overflow-hidden rounded bg-gray-50"
                    >
                      {image && <Img candidates={[image]} alt="" className="max-h-full object-contain" />}
                    </span>
                  );
                })}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-gray-800">
                  {name(a)} <span className="text-gray-300">vs</span> {name(b)}
                </p>
                <p className="truncate text-[9px] text-gray-400">
                  {a.segment ?? ""} · 코어차 {diff.toFixed(2)}m³
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
