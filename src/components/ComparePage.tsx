import { useEffect, useRef, useState } from "react";
import { ChevronDown, Shuffle } from "lucide-react";
import { boxVolume, CARS, spaceVolume, type Car } from "../data/cars";
import { BoxBuilder } from "./BoxBuilder";
import { CarPicker } from "./CarPicker";
import { comparePath } from "../data/compare-url";
import { ShareButton } from "@m1kapp/kit";
import { PairShortcuts } from "./PairShortcuts";

/** 앞 두 항목(성인사람·주차장)은 기준자라서 랜덤 대상에서 뺀다 */
const RANDOM_POOL = CARS.slice(2);

const byName = (name: string | null) => CARS.find((c) => c.name === name) ?? null;

type Metric = {
  label: string;
  /** 두 값의 차이를 읽는 말 — "더 크다" / "더 길다" */
  verb: string;
  get: (car: Car) => number;
  format: (diff: number) => string;
  className?: string;
};

const mm = (diff: number) => `${diff}mm`;
const m3 = (diff: number) => `${diff.toFixed(2)}m³`;

const METRICS: Metric[] = [
  { label: "코어", verb: "더 크다", get: spaceVolume, format: m3, className: "text-blue-600" },
  { label: "외형", verb: "더 크다", get: boxVolume, format: m3, className: "text-purple-600" },
  { label: "축거", verb: "더 길다", get: (c) => c.xInSize, format: mm },
  { label: "전장", verb: "더 길다", get: (c) => c.xSize, format: mm },
  { label: "전폭", verb: "더 넓다", get: (c) => c.ySize, format: mm },
  { label: "전고", verb: "더 높다", get: (c) => c.zSize, format: mm },
];

function pickRandomPair(): [string, string] {
  const first = Math.floor(Math.random() * RANDOM_POOL.length);
  let second = Math.floor(Math.random() * (RANDOM_POOL.length - 1));
  if (second >= first) second += 1; // 같은 차가 두 번 뽑히지 않게 한 칸 민다
  return [RANDOM_POOL[first].name, RANDOM_POOL[second].name];
}

/** 지정한 차 말고 아무 차나 한 대 */
function pickRandomOther(exclude: string): string {
  const pool = RANDOM_POOL.filter((c) => c.name !== exclude);
  return pool[Math.floor(Math.random() * pool.length)].name;
}

export function ComparePage({ initial, opponent }: { initial?: Car | null; opponent?: Car | null }) {
  const [names, setNames] = useState<[string | null, string | null]>([null, null]);
  const [left, right] = [byName(names[0]), byName(names[1])];

  // 목록에서 고른 차가 있으면 그 차를 왼쪽에 두고 상대만 랜덤으로,
  // 그냥 탭으로 들어왔으면 빈 화면 대신 랜덤 두 대를 보여준다
  useEffect(() => {
    if (initial && opponent) setNames([initial.name, opponent.name]);
    else setNames(initial ? [initial.name, pickRandomOther(initial.name)] : pickRandomPair());
  }, [initial, opponent]);

  // 고른 조합을 주소에 남긴다 — 공유·북마크되면 그대로 검색엔진에 잡힌다
  useEffect(() => {
    if (!left || !right) return;
    const path = comparePath(left, right);
    if (window.location.pathname !== path) window.history.replaceState(null, "", path);
  }, [left, right]);

  const listRef = useRef<HTMLDivElement>(null);

  const setAt = (index: 0 | 1, name: string) =>
    setNames((prev) => (index === 0 ? [name, prev[1]] : [prev[0], name]));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {([0, 1] as const).map((index) => {
          const car = index === 0 ? left : right;
          return (
            <div key={index} className="flex flex-col">
              <CarPicker value={car} onChange={(picked) => setAt(index, picked.name)} />
              <div className="mt-2">
                {car ? (
                  <BoxBuilder car={car} showTitle={false} />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-xl bg-white shadow-lg">
                    <p className="text-sm text-gray-500">차량을 선택해주세요</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {left && right && (
        <div className="rounded-xl bg-white p-4 shadow-lg">
          <div className="mb-4 text-center font-medium text-gray-700">차량 크기 비교</div>
          <div className="flex flex-col gap-2 text-sm">
            {METRICS.map((metric) => (
              <MetricRow key={metric.label} metric={metric} left={left} right={right} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setNames(pickRandomPair())}
          className="flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-black/5 transition-all hover:bg-gray-50 active:scale-[0.98]"
        >
          <Shuffle className="h-4 w-4" />
          랜덤
        </button>

        {/* 공유하면 그 조합 주소가 그대로 나간다 — 받는 사람은 같은 비교를 바로 본다 */}
        {left && right && (
          <ShareButton
            url={`https://carboxsize.m1k.app${comparePath(left, right)}`}
            title={`${left.name.split(" (")[0]} vs ${right.name.split(" (")[0]} 크기 비교`}
          />
        )}
      </div>

      {/* 아래에 더 있다는 신호 — 없으면 비교 한 번 하고 나간다 */}
      <button
        onClick={() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="mx-auto -mb-1 flex items-center gap-1 py-1 text-[11px] text-gray-400 transition-colors hover:text-gray-600"
      >
        자주 비교하는 조합 보기
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <div ref={listRef} className="scroll-mt-2">
        <PairShortcuts current={names} onPick={([a, b]) => setNames([a.name, b.name])} />
      </div>
    </div>
  );
}

function MetricRow({ metric, left, right }: { metric: Metric; left: Car; right: Car }) {
  const diff = metric.get(left) - metric.get(right);
  const winner = diff > 0 ? left : right;

  return (
    <div className="flex gap-2">
      <div className={`w-10 shrink-0 ${metric.className ?? ""}`}>{metric.label}</div>
      <div className="flex-1">
        {diff === 0 ? (
          <span className="text-gray-500">두 차량의 {metric.label}이(가) 같습니다</span>
        ) : (
          <span>
            <b>{winner.name}</b> 차가 {metric.format(Math.abs(diff))} {metric.verb}
          </span>
        )}
      </div>
    </div>
  );
}
