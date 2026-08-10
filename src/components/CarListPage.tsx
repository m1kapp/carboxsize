import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CARS } from "../data/cars";
import { SALES_MONTH } from "../data/sales";
import { matchesQuery } from "../data/search";
import { SORT_KEYS, SORT_LABELS, sortCars, type SortDir, type SortKey } from "../data/sort";
import { BoxBuilder } from "./BoxBuilder";

/** 판매량은 많이 팔린 순으로 보는 게 자연스럽고, 치수는 작은 것부터 보는 게 자연스럽다. */
const defaultDir = (key: SortKey): SortDir => (key === "sales" ? "desc" : "asc");

const monthLabel = (ym: string) => `${Number(ym.slice(5, 7))}월`;

export function CarListPage() {
  const [sortKey, setSortKey] = useState<SortKey>("sales");
  const [dir, setDir] = useState<SortDir>(defaultDir("sales"));
  const [query, setQuery] = useState("");

  const cars = useMemo(() => {
    const found = CARS.filter((c) => matchesQuery(query, c.name, c.brand));
    return sortCars(found, sortKey, dir);
  }, [sortKey, dir, query]);

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

      <div className="grid w-full grid-cols-7 gap-1">
        {SORT_KEYS.map((key) => {
          const active = key === sortKey;
          return (
            <button
              key={key}
              onClick={() => pick(key)}
              className={`w-full min-w-0 rounded-lg px-1 py-2 text-xs font-medium transition-all ${
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

      <p className="-mt-2 text-center text-[11px] text-gray-400">
        {sortKey === "sales"
          ? `국산차 ${monthLabel(SALES_MONTH.domestic)} · 수입차 ${monthLabel(SALES_MONTH.imported)} 신차 등록 대수 (다나와)`
          : `${cars.length}대`}
      </p>

      <div className="grid grid-cols-2 gap-4">
        {cars.map((car) => (
          <BoxBuilder key={car.name} car={car} />
        ))}
      </div>

      {cars.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">찾는 차가 없어요</p>
      )}
    </div>
  );
}
