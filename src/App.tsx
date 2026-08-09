import { useState } from "react";
import { AppShell, AppShellContent, AppShellHeader, Tab, TabBar, Watermark } from "@m1kapp/kit";
import { GitCompare, LayoutGrid } from "lucide-react";
import { CarListPage } from "./components/CarListPage";
import { ComparePage } from "./components/ComparePage";

const ACCENT = "#7c3aed";

type Section = "list" | "compare";

export default function App() {
  const [section, setSection] = useState<Section>("list");

  return (
    <Watermark color={ACCENT} text="carboxsize">
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
          <div className="m-4">{section === "list" ? <CarListPage /> : <ComparePage />}</div>
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
            onClick={() => setSection("compare")}
            label="비교하기"
            icon={<GitCompare className="h-5 w-5" />}
            activeColor={ACCENT}
          />
        </TabBar>
      </AppShell>
    </Watermark>
  );
}
