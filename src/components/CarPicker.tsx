import { useMemo, useState } from "react";
import { Dialog, Img } from "@m1kapp/kit";
import { ChevronDown, Search } from "lucide-react";
import { CARS, carImageUrl, spaceVolume, type Car } from "../data/cars";
import { danawaRecordUrl, formatMonth, importedPending, LATEST_MONTH, salesOf, SALES_MONTHS } from "../data/sales";
import { matchesQuery } from "../data/search";

type Props = {
  value: Car | null;
  onChange: (car: Car) => void;
  placeholder?: string;
};

/** 판매량 있는 차가 위로, 그 안에서 많이 팔린 순. 판매 집계에 없는 차는 코어 큰 순. */
const byPopularity = (month: string) => (a: Car, b: Car) => {
  const [sa, sb] = [salesOf(a.no, month) ?? -1, salesOf(b.no, month) ?? -1];
  return sb - sa || spaceVolume(b) - spaceVolume(a);
};

export function CarPicker({ value, onChange, placeholder = "차량을 선택해주세요" }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState(LATEST_MONTH);

  const results = useMemo(
    () => CARS.filter((c) => matchesQuery(query, c.name, c.brand)).sort(byPopularity(month)),
    [query, month],
  );

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-1 rounded-lg border border-gray-300 bg-white p-3 text-left text-sm shadow-sm"
      >
        <span className={`truncate ${value ? "text-gray-900" : "text-gray-400"}`}>
          {value?.name ?? placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      <Dialog open={open} onClose={close} title="차량 선택" size="sm">
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-gray-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="차 이름 · 브랜드 · 초성(ㅅㅌㅅ)"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-2 mb-1 flex flex-wrap items-center gap-1">
          {SALES_MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => setMonth(m)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
                m === month ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {formatMonth(m)}
            </button>
          ))}
        </div>
        <p className="mb-1 text-[11px] text-gray-400">
          {query ? (
            `${results.length}대`
          ) : (
            <>
              {formatMonth(month)} 많이 팔린 순{importedPending(month) && " · 수입차 집계 중"} ·{" "}
              <a
                href={danawaRecordUrl(month)}
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-dotted underline-offset-2 hover:text-gray-600"
              >
                다나와
              </a>
            </>
          )}
        </p>

        <ul className="-mx-1 max-h-[50vh] overflow-y-auto">
          {results.map((car) => {
            const units = salesOf(car.no, month);
            const image = carImageUrl(car.no);
            return (
              <li key={car.name}>
                <button
                  onClick={() => {
                    onChange(car);
                    close();
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-1 py-2 text-left hover:bg-gray-50 ${
                    car.name === value?.name ? "bg-gray-100" : ""
                  }`}
                >
                  <div className="flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded bg-gray-100">
                    {image && <Img candidates={[image]} alt="" className="max-h-full object-contain" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-gray-900">{car.name}</div>
                    <div className="truncate text-xs text-gray-500">{car.brand ?? "기준"}</div>
                  </div>
                  {units != null && (
                    <span className="shrink-0 text-xs text-gray-400">{units.toLocaleString()}대</span>
                  )}
                </button>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="py-8 text-center text-sm text-gray-400">찾는 차가 없어요</li>
          )}
        </ul>
      </Dialog>
    </>
  );
}
