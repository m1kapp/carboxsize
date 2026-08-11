import { useState } from "react";
import { AppShell, AppShellContent, AppShellHeader, Tab, TabBar, Watermark } from "@m1kapp/kit";
import { BookOpen, GitCompare, LayoutGrid } from "lucide-react";
import type { Car } from "./data/cars";
import { CarListPage } from "./components/CarListPage";
import { ComparePage } from "./components/ComparePage";
import { KnowledgePage } from "./components/KnowledgePage";
import { parseComparePath } from "./data/compare-url";
import { SITE } from "./config";

const ACCENT = SITE.accent;

type Section = "list" | "compare" | "facts";

// /compare/A-vs-B 로 들어오면 그 조합을 펼친 채 시작한다 (검색 유입 경로)
const initialPair = typeof window !== "undefined" ? parseComparePath(window.location.pathname) : null;

export default function App() {
  const [section, setSection] = useState<Section>(initialPair ? "compare" : "list");
  // 목록에서 고른 차 — 비교 화면 왼쪽 칸을 이 차로 채운 채 연다
  const [picked, setPicked] = useState<Car | null>(initialPair?.[0] ?? null);

  const openCompare = (car: Car) => {
    setPicked(car);
    setSection("compare");
  };

  return (
    <Watermark
      color={ACCENT}
      text="carboxsize"
      trackSlug={SITE.tracker.slug}
      claimed={SITE.tracker.claimed}
    >
      <AppShell accent={ACCENT}>
        <AppShellHeader>
          <div className="flex w-full flex-col items-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              Car Box Size
            </div>
            <div className="text-xs tracking-tighter text-gray-500">
              <span className="text-blue-600">코어 = 축거</span> x 전폭 x 전고 /{" "}
              <span className="text-purple-600">외형 = 전장</span> x 전폭 x 전고
            </div>
          </div>
        </AppShellHeader>

        <AppShellContent>
          <div className="m-4">
            {section === "list" && <CarListPage onCompare={openCompare} />}
            {/* key를 바꿔 새로 고른 차로 다시 시작하게 한다 */}
            {section === "compare" && (
              <ComparePage
                key={picked?.name ?? "random"}
                initial={picked}
                opponent={initialPair?.[1] ?? null}
              />
            )}
            {section === "facts" && <KnowledgePage />}
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
          <Tab
            active={section === "facts"}
            onClick={() => setSection("facts")}
            label="상식"
            icon={<BookOpen className="h-5 w-5" />}
            activeColor={ACCENT}
          />
        </TabBar>
      </AppShell>
    </Watermark>
  );
}
