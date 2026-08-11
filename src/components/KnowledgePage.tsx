import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MECHANICAL_LIMITS } from "../data/parking";

type Item = { q: string; a: React.ReactNode };

const mm = (n: number) => n.toLocaleString();

const ITEMS: Item[] = [
  {
    q: "코어와 외형이 뭐가 다른가요?",
    a: (
      <>
        <p>
          <b className="text-blue-600">코어</b> = 축거 × 전폭 × 전고. 앞뒤 범퍼(오버행)를 뺀,
          바퀴 사이 덩어리의 부피예요.
        </p>
        <p className="mt-2">
          <b className="text-purple-600">외형</b> = 전장 × 전폭 × 전고. 범퍼까지 포함해서 차가
          주차장에서 실제로 차지하는 부피고요.
        </p>
        <p className="mt-2">
          전장이 긴데 코어는 작은 차가 있어요. 범퍼가 길게 튀어나온 차죠. 반대로 전장이 짧아도
          바퀴를 네 귀퉁이로 밀어낸 차는 코어가 큽니다.
        </p>
      </>
    ),
  },
  {
    q: "코어가 크면 실내가 넓은 건가요?",
    a: (
      <>
        <p>
          <b>아니요.</b> 코어는 차 바깥 치수로 만든 상자라서 차체 두께·천장·바닥·지상고가 전부
          들어가 있어요. 실측 실내 용적이 아닙니다.
        </p>
        <p className="mt-2">
          미국 EPA가 실내 용적을 공개한 24대와 대조해봤어요. 코어의 <b>약 42%</b>가 실제
          승객+화물 공간이었고, 순위는 <b>같은 차급 안에서만</b> 얼추 맞았습니다. 세단끼리는 잘
          맞는데 크로스오버끼리는 거의 무관했어요.
        </p>
        <p className="mt-2">
          재밌는 건, 실제 실내 부피와 가장 상관이 높은 치수는 <b>전고</b>였다는 거예요. 축거는
          거의 무관했고요. 부피는 천장 높이가 좌우하니까요.
        </p>
      </>
    ),
  },
  {
    q: "왜 하필 축거로 재나요?",
    a: (
      <>
        <p>
          축거 × 폭으로 차 크기를 재는 건 미국 연비 규제가 쓰는 방식이에요.{" "}
          <b>footprint</b>라고 부르고, 축거 × 윤거로 계산합니다(49 CFR 523.2).
        </p>
        <p className="mt-2">
          전장은 범퍼 디자인만 바꿔도 늘었다 줄었다 하는데, 축거는 차의 뼈대라 잘 안 변해요.
          그래서 "이 차가 얼마나 큰 차인가"를 볼 때 전장보다 축거를 봅니다.
        </p>
      </>
    ),
  },
  {
    q: "요즘 차는 왜 이렇게 커졌나요?",
    a: (
      <>
        <p>
          규제 때문이라는 분석이 있어요. 미국 연비 규제(CAFE)는 footprint가 <b>클수록 연비 기준을
          느슨하게</b> 줍니다. 작은 차일수록 지켜야 할 기준이 빡빡해요.
        </p>
        <p className="mt-2">
          그래서 제조사 입장에선 차를 키우는 쪽이 규제상 유리해집니다. 미시간대 연구는 이 구조가
          큰 차를 만들 이윤 동기를 만든다고 지적했어요.
        </p>
      </>
    ),
  },
  {
    q: "기계식 주차장에 못 들어가는 차가 있다던데",
    a: (
      <>
        <p>주차장법 시행규칙 제16조의2가 규격을 정해두고 있어요.</p>
        <table className="mt-2 w-full text-[11px] tabular-nums">
          <thead className="text-gray-400">
            <tr>
              <th className="text-left font-normal">규격</th>
              <th className="text-right font-normal">길이</th>
              <th className="text-right font-normal">너비</th>
              <th className="text-right font-normal">높이</th>
              <th className="text-right font-normal">무게</th>
            </tr>
          </thead>
          <tbody>
            {(["중형", "대형"] as const).map((size) => {
              const l = MECHANICAL_LIMITS[size];
              return (
                <tr key={size}>
                  <td className="font-semibold">{size}</td>
                  <td className="text-right">{mm(l.length)}</td>
                  <td className="text-right">{mm(l.width)}</td>
                  <td className="text-right">{mm(l.height)}</td>
                  <td className="text-right">{mm(l.weight)}kg</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2">
          여기 실린 100종 중 <b>22대</b>가 중형에 못 들어갑니다. 그중 12대는 대형도 안 되고요.
        </p>
        <p className="mt-2">
          놓치기 쉬운 게 <b>무게</b>예요. 치수만 보면 13대인데, 무게까지 넣으면 22대로 늘어납니다.
          배터리를 얹은 전기차가 치수는 멀쩡한데 무게에서 걸리는 경우가 많아요.
        </p>
      </>
    ),
  },
  {
    q: "일반 주차장은 얼마나 큰가요?",
    a: (
      <>
        <p>
          일반형 주차단위구획은 <b>너비 2.5m × 길이 5.0m</b>입니다. 2019년 3월부터 이 규격이고,
          그 전에는 너비가 2.3m였어요. 차가 커져서 넓힌 겁니다.
        </p>
        <p className="mt-2">
          그런데 지금도 전장 5m를 넘는 차가 꽤 있어요. 카니발·스타리아·G90처럼요. 주차선 밖으로
          나온다는 뜻입니다.
        </p>
      </>
    ),
  },
  {
    q: "전폭에 사이드미러는 포함인가요?",
    a: (
      <>
        <p>
          여기 적힌 전폭은 <b>미러를 뺀 값</b>이에요. 출처에 따라 미러 포함·접힘 값을 섞어 쓰는
          경우가 있는데, 그러면 차끼리 비교가 깨집니다.
        </p>
        <p className="mt-2">
          예를 들어 사이버트럭은 미러 제외 2,032 / 접으면 2,201 / 펴면 2,413으로 셋 다 달라요.
          실제 주차할 땐 미러를 접으니 접힘 값도 의미가 있지만, 비교의 기준은 하나로 통일했습니다.
        </p>
      </>
    ),
  },
  {
    q: "데이터는 어디서 오나요?",
    a: (
      <>
        <p>
          제원·판매량 모두{" "}
          <a
            href="https://auto.danawa.com/auto/"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-dotted underline-offset-2"
          >
            다나와 자동차
          </a>
          예요. 차 이름을 누르면 그 차의 제원 페이지로 갑니다.
        </p>
        <p className="mt-2">
          다나와와 어긋나는 값은 제조사 공식 제원으로 확정했어요. 판매량은 월별로 다시 받아오고,
          수입차는 다나와가 한 달 늦게 집계해서 최근 달은 덜 차 있을 수 있습니다.
        </p>
      </>
    ),
  },
];

export function KnowledgePage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-2">
      <p className="px-1 text-[11px] text-gray-400">
        차 크기를 두고 자주 헷갈리는 것들을 정리했어요.
      </p>

      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
            >
              <span className="text-[13px] font-semibold text-gray-800">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="px-3 pb-3 text-[12px] leading-relaxed text-gray-600">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
