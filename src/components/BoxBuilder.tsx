import type { CSSProperties } from "react";
import { Img } from "@m1kapp/kit";
import { boxVolume, carImageUrl, danawaModelUrl, spaceVolume, type Car } from "../data/cars";
import { LATEST_MONTH, salesOf } from "../data/sales";
import { CHIP_TONE, chipsFor } from "../data/rank";
import { checkParking } from "../data/parking";

/** mm → px. 1/32 배율이면 가장 큰 차(5410mm)도 카드 한 칸(169px)에 들어간다. */
const SCALE = 1 / 32;
const px = (mm: number) => mm * SCALE;

export type Rotation = { x: number; y: number; z: number };

export const DEFAULT_ROTATION: Rotation = { x: 8, y: 128, z: 0 };

type Props = {
  car: Car;
  rotation?: Rotation;
  boxColor?: string;
  /** 카드 상단 제목 줄 — 비교 화면처럼 이름을 밖에서 그릴 땐 끈다 */
  showTitle?: boolean;
  /** 판매 순위 칩과 대수를 어느 달 기준으로 볼지 */
  month?: string;
};

export function BoxBuilder({
  car,
  rotation = DEFAULT_ROTATION,
  boxColor = "rgba(0,0,0,0.055)",
  showTitle = true,
  month = LATEST_MONTH,
}: Props) {
  const { xSize, ySize, zSize, xInSize } = car;
  const imageUrl = carImageUrl(car.no);
  const sourceUrl = danawaModelUrl(car.no);
  const units = salesOf(car.no, month);
  const chips = chipsFor(car, month);
  const parking = checkParking(car);

  // 상자 6면 — 앞뒤 / 위아래 / 좌우
  const faces: CSSProperties[] = [
    { width: px(xSize), height: px(zSize), transform: `translateZ(${px(ySize) / 2}px)` },
    { width: px(xSize), height: px(zSize), transform: `translateZ(${-px(ySize) / 2}px)` },
    { width: px(xSize), height: px(ySize), transform: `rotateX(90deg) translateZ(${px(zSize) / 2}px)` },
    { width: px(xSize), height: px(ySize), transform: `rotateX(90deg) translateZ(${-px(zSize) / 2}px)` },
    { width: px(ySize), height: px(zSize), transform: `rotateY(90deg) translateZ(${px(xSize) / 2}px)` },
    { width: px(ySize), height: px(zSize), transform: `rotateY(90deg) translateZ(${-px(xSize) / 2}px)` },
  ];

  return (
    <div className="relative flex min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-black/5">
      {showTitle && (
        <div className="flex items-baseline justify-between gap-1 px-2 pt-2 pb-1">
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              title="다나와 제원 보기"
              onClick={(e) => e.stopPropagation()}
              className="truncate text-sm font-semibold text-gray-800 underline decoration-gray-300 decoration-dotted underline-offset-2"
            >
              {car.name}
            </a>
          ) : (
            <h3 className="truncate text-sm font-semibold text-gray-800">{car.name}</h3>
          )}
          {units != null && (
            <span className="shrink-0 text-[10px] text-gray-400">{units.toLocaleString()}대</span>
          )}
        </div>
      )}

      <div className="relative z-1 flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-gray-200 to-gray-500">
        {imageUrl && (
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <Img
              candidates={[imageUrl]}
              alt={`${car.name} 이미지`}
              className="object-contain"
              style={{ width: px(xSize) }}
            />
          </div>
        )}

        {chips.length > 0 && (
          <div className="absolute top-1 left-1 z-20 flex flex-col items-start gap-1">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-tight text-white shadow ${CHIP_TONE[chip.tone]}`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        )}

        <div
          className="box-container relative z-10"
          style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)` }}
        >
          {faces.map((style, i) => (
            <div key={i} className="box-face" style={{ ...style, backgroundColor: boxColor }} />
          ))}
        </div>
      </div>

      {parking && parking.fits !== "중형" && (
        <p
          className="px-2 pt-1.5 text-[9px] leading-tight text-amber-700"
          title={`기계식 주차장 제한 초과: ${parking.blockedBy.join(", ")}`}
        >
          기계식 {parking.fits === "대형" ? "대형만" : "불가"} · {parking.blockedBy.join(" · ")}
        </p>
      )}

      <dl className="grid grid-cols-3 gap-x-1 gap-y-0.5 px-2 pt-1.5 pb-2 text-[11px] tracking-tighter">
        <Spec label="전장" unit="(mm)" value={xSize} />
        <Spec label="전폭" unit="(mm)" value={ySize} />
        <Spec label="전고" unit="(mm)" value={zSize} />
        <Spec label="축거" unit="(mm)" value={xInSize} />
        <Spec label="코어" value={`${spaceVolume(car)}m³`} className="text-blue-600" />
        <Spec label="외형" value={`${boxVolume(car)}m³`} className="text-purple-600" />
      </dl>
    </div>
  );
}

function Spec({
  label,
  unit,
  value,
  className,
}: {
  label: string;
  unit?: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-gray-500">
        {label}
        {unit && <span className="text-[8px]">{unit}</span>}
      </dt>
      <dd className={className}>{value}</dd>
    </div>
  );
}
