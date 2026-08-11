import { Img } from "@m1kapp/kit";
import { carImageUrl, spaceVolume, type Car } from "../data/cars";
import { PAIRS } from "../data/pairs";

const shortName = (car: Car) => car.name.split(" (")[0];

/**
 * 자주 비교하는 조합 — 랜덤 버튼 아래 바로가기.
 *
 * 비교 화면에 처음 오면 뭘 골라야 할지 막막하다. 검색창을 두 번 여는 대신
 * 남들이 실제로 저울질하는 조합을 눌러서 시작할 수 있게 한다.
 *
 * 가로 스크롤로 두는 이유: 세로 그리드에 욱여넣으면 카드가 작아져서 차 사진이 안 보이고,
 * 안 보이면 누를 이유도 없다. 옆으로 넘기면 카드를 크게 쓸 수 있다.
 * 목록은 SEO 비교 페이지와 같은 것을 쓴다(src/data/pairs.ts).
 */
export function PairShortcuts({
  current,
  onPick,
  limit = 20,
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

      {/* 카드가 화면 밖까지 이어지도록 좌우 여백을 뚫는다 — 잘린 카드가 보여야 넘길 수 있다는 걸 안다 */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {shown.map(([a, b]) => {
          const active =
            (current[0] === a.name && current[1] === b.name) ||
            (current[0] === b.name && current[1] === a.name);
          const diff = Math.abs(spaceVolume(a) - spaceVolume(b));

          return (
            <button
              key={`${a.name}|${b.name}`}
              onClick={() => onPick([a, b])}
              className={`w-[148px] shrink-0 overflow-hidden rounded-xl bg-white text-left shadow-sm ring-1 transition-all active:scale-[0.98] ${
                active ? "ring-2 ring-blue-500" : "ring-black/5 hover:shadow-md"
              }`}
            >
              <div className="flex h-[62px] items-end gap-0.5 bg-gradient-to-br from-gray-100 to-gray-300 px-1">
                {[a, b].map((car) => {
                  const image = carImageUrl(car.no);
                  return (
                    <span key={car.name} className="flex h-full flex-1 items-center justify-center overflow-hidden">
                      {image && <Img candidates={[image]} alt="" className="max-h-full object-contain" />}
                    </span>
                  );
                })}
              </div>

              <div className="px-2 py-1.5">
                <p className="truncate text-[11px] font-bold text-gray-800">{shortName(a)}</p>
                <p className="truncate text-[11px] font-bold text-gray-800">
                  <span className="text-[9px] font-normal text-gray-400">vs </span>
                  {shortName(b)}
                </p>
                <p className="mt-0.5 truncate text-[9px] tabular-nums text-gray-400">
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
