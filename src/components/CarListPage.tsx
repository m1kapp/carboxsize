import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CARS, type Car } from "../data/cars";
import { danawaRecordUrl, formatMonth, importedPending, LATEST_MONTH, SALES_MONTHS } from "../data/sales";
import { matchesQuery } from "../data/search";
import { checkParking } from "../data/parking";
import { SORT_KEYS, SORT_LABELS, sortCars, type SortDir, type SortKey } from "../data/sort";
import { BoxBuilder } from "./BoxBuilder";

/** 판매량은 많이 팔린 순으로 보는 게 자연스럽고, 치수는 작은 것부터 보는 게 자연스럽다. */
const defaultDir = (key: SortKey): SortDir => (key === "sales" ? "desc" : "asc");

export function CarListPage({ onCompare }: { onCompare: (car: Car) => void }) {
  const [sortKey, setSortKey] = useState<SortKey>("sales");
  const [dir, setDir] = useState<SortDir>(defaultDir("sales"));
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState(LATEST_MONTH);
  // 도심에서 차 고를 때 실제로 걸리는 벽이라 목록에서 바로 걸러볼 수 있게 한다
  const [mechanicalOnly, setMechanicalOnly] = useState(false);

  const cars = useMemo(() => {
    const found = CARS.filter((c) => matchesQuery(query, c.name, c.brand)).filter(
      (c) => !mechanicalOnly || checkParking(c)?.fits === "중형",
    );
    return sortCars(found, sortKey, dir, month);
  }, [sortKey, dir, query, month, mechanicalOnly]);

  // 같은 기준을 다시 누르면 방향만 뒤집고, 다른 기준으로 옮기면 그 기준의 기본 방향으로
  const pick = (key: SortKey) => {
    if (key === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir(defaultDir(key));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="차 이름 · 브랜드 · 초성(ㅅㅌㅅ)"
          className="w-full bg-transparent text-sm outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="검색어 지우기">
            <X className="h-4 w-4 shrink-0 text-gray-400" />
          </button>
        )}
      </div>

      <button
        onClick={() => setMechanicalOnly((v) => !v)}
        className={`-mt-2 self-start rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
          mechanicalOnly ? "bg-gray-800 text-white" : "bg-white text-gray-500 shadow-sm hover:bg-gray-50"
        }`}
        title="주차장법 시행규칙 제16조의2 · 중형 기계식(5.2m · 2.0m · 1.85m · 2,350kg)"
      >
        기계식 주차 되는 차만
      </button>

      <div className="grid w-full grid-cols-7 gap-1">
        {SORT_KEYS.map((key) => {
          const active = key === sortKey;
          return (
            <button
              key={key}
              onClick={() => pick(key)}
              className={`w-full min-w-0 rounded-lg px-1 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                  : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
              }`}
            >
              {SORT_LABELS[key]}
              {active && <span className="ml-0.5">{dir === "asc" ? "↑" : "↓"}</span>}
            </button>
          );
        })}
      </div>

      {sortKey === "sales" ? (
        <MonthPicker month={month} onChange={setMonth} />
      ) : (
        <p className="-mt-2 text-center text-[11px] text-gray-400">{cars.length}대</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {cars.map((car) => (
          <button
            key={car.name}
            onClick={() => onCompare(car)}
            title={`${car.name} 비교하기`}
            className="min-w-0 cursor-pointer text-left transition-transform active:scale-[0.98]"
          >
            <BoxBuilder car={car} month={month} />
          </button>
        ))}
      </div>

      {cars.length === 0 && <p className="py-10 text-center text-sm text-gray-400">찾는 차가 없어요</p>}
    </div>
  );
}

/** 판매 기준월 선택 — 어느 달 통계를 보고 있는지 화면에 늘 떠 있게 한다. */
export function MonthPicker({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  return (
    <div className="-mt-2 flex flex-col items-center gap-1">
      <div className="flex gap-1 overflow-x-auto">
        {SALES_MONTHS.map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-medium transition-all ${
              m === month ? "bg-gray-800 text-white" : "bg-white text-gray-500 shadow-sm hover:bg-gray-50"
            }`}
          >
            {formatMonth(m)}
          </button>
        ))}
      </div>
      <p className="text-center text-[11px] text-gray-400">
        {formatMonth(month)} 신차 등록 대수{" "}
        <a
          href={danawaRecordUrl(month)}
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-dotted underline-offset-2 hover:text-gray-600"
        >
          다나와
        </a>
        {importedPending(month) && " · 수입차는 아직 집계 중"}
      </p>
    </div>
  );
}
