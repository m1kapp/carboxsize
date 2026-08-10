import { useState } from "react";
import { AppShell, AppShellContent, AppShellHeader, Tab, TabBar, Watermark } from "@m1kapp/kit";
import { GitCompare, LayoutGrid } from "lucide-react";
import type { Car } from "./data/cars";
import { CarListPage } from "./components/CarListPage";
import { ComparePage } from "./components/ComparePage";

const ACCENT = "#2563eb";
// npx m1kkit track https://carboxsize.m1k.app 으로 받은 slug.
// Vite라 NEXT_PUBLIC_* env를 kit이 못 읽어서 prop으로 직접 넘긴다.
// claimed는 서버가 알려주는 값이 아니라 크레딧에 표시만 하는 prop이라 직접 켠다.
// (m1k.app /api/builders 에서 소유자 wingedcompany 로 귀속 확인함)
const TRACK_SLUG = "gG";

type Section = "list" | "compare";

export default function App() {
  const [section, setSection] = useState<Section>("list");
  // 목록에서 고른 차 — 비교 화면 왼쪽 칸을 이 차로 채운 채 연다
  const [picked, setPicked] = useState<Car | null>(null);

  const openCompare = (car: Car) => {
    setPicked(car);
    setSection("compare");
  };

  return (
    <Watermark color={ACCENT} text="carboxsize" trackSlug={TRACK_SLUG} claimed>
      <AppShell accent={ACCENT}>
        <AppShellHeader>
          <div className="flex w-full flex-col items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Car Box Size
            </div>
            <div className="text-xs tracking-tighter text-gray-500">
              <span className="text-blue-600">공간 = 축거</span> x 전폭 x 전고 /{" "}
              <span className="text-purple-600">외형 = 전장</span> x 전폭 x 전고
            </div>
          </div>
        </AppShellHeader>

        <AppShellContent>
          <div className="m-4">
            {section === "list" ? (
              <CarListPage onCompare={openCompare} />
            ) : (
              // key를 바꿔 새로 고른 차로 다시 시작하게 한다
              <ComparePage key={picked?.name ?? "random"} initial={picked} />
            )}
          </div>
        </AppShellContent>

        <TabBar>
          <Tab
            active={section === "list"}
            onClick={() => setSection("list")}
            label="전체보기"
            icon={<LayoutGrid className="h-5 w-5" />}
            activeColor={ACCENT}
          />
          <Tab
            active={section === "compare"}
            onClick={() => {
              setPicked(null);
              setSection("compare");
            }}
            label="비교하기"
            icon={<GitCompare className="h-5 w-5" />}
            activeColor={ACCENT}
          />
        </TabBar>
      </AppShell>
    </Watermark>
  );
}
