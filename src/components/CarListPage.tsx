import { useMemo, useState } from "react";
import { CARS } from "../data/cars";
import { SORT_KEYS, SORT_LABELS, sortCars, type SortDir, type SortKey } from "../data/sort";
import { BoxBuilder } from "./BoxBuilder";

export function CarListPage() {
  const [sortKey, setSortKey] = useState<SortKey>("spaceVolume");
  const [dir, setDir] = useState<SortDir>("asc");

  const cars = useMemo(() => sortCars(CARS, sortKey, dir), [sortKey, dir]);

  // 같은 기준을 다시 누르면 방향만 뒤집고, 다른 기준으로 옮기면 오름차순부터 시작
  const pick = (key: SortKey) => {
    if (key === sortKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir("asc");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid w-full grid-cols-6 gap-2">
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
              {active && <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cars.map((car) => (
          <BoxBuilder key={car.name} car={car} />
        ))}
      </div>
    </div>
  );
}
