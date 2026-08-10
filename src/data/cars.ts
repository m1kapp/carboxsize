export type Car = {
  /** 이름 — `모델 (연식)` 형식 */
  name: string;
  /** 전장(mm) */
  xSize: number;
  /** 전폭(mm) */
  ySize: number;
  /** 전고(mm) */
  zSize: number;
  /** 축거(mm) */
  xInSize: number;
  /** 트렁크 용량(L) */
  trunk?: number;
  brand?: string;
  /** 다나와 이미지 번호 */
  no?: number;
};

/** 축거 x 전폭 x 전고 (m³) — 실내에 쓸 수 있는 "공간" */
export const spaceVolume = (c: Car) => volume(c.xInSize, c.ySize, c.zSize);

/** 전장 x 전폭 x 전고 (m³) — 주차장에서 차지하는 "외형" */
export const boxVolume = (c: Car) => volume(c.xSize, c.ySize, c.zSize);

const volume = (a: number, b: number, c: number) =>
  Math.round((a * b * c * 100) / 1_000_000_000) / 100;

export const carImageUrl = (no?: number) =>
  no ? `https://autoimg.danawa.com/photo/${no}/model_360.png` : null;

export const CARS: Car[] = [
  { name: "성인사람", xSize: 500, ySize: 500, zSize: 1700, xInSize: 0 },
  { name: "주차장", xSize: 5000, ySize: 2300, zSize: 300, xInSize: 0 },
  { name: "캐스퍼 (2025)", xSize: 3595, ySize: 1595, zSize: 1605, xInSize: 2400, brand: "현대", no: 4671 },
  { name: "캐스퍼EV (2025)", xSize: 3845, ySize: 1610, zSize: 1610, xInSize: 2580, brand: "현대", no: 4653 },
  { name: "아반떼 (2026/25/23)", xSize: 4710, ySize: 1825, zSize: 1420, xInSize: 2720, trunk: 474, brand: "현대", no: 4455 },
  { name: "아반떼N (2026/25/23)", xSize: 4710, ySize: 1825, zSize: 1415, xInSize: 2720, brand: "현대", no: 4564 },
  { name: "쏘나타 (2025/24)", xSize: 4910, ySize: 1860, zSize: 1445, xInSize: 2840, trunk: 480, brand: "현대", no: 4466 },
  { name: "아이오닉6 (2024/23)", xSize: 4855, ySize: 1880, zSize: 1495, xInSize: 2950, brand: "현대", no: 4087 },
  { name: "그랜저 (2027)", xSize: 5050, ySize: 1880, zSize: 1460, xInSize: 2895, trunk: 480, brand: "현대", no: 4802 },
  { name: "베뉴 (2025/23)", xSize: 4040, ySize: 1770, zSize: 1585, xInSize: 2520, brand: "현대", no: 3654 },
  { name: "코나 (2025/24/23)", xSize: 4350, ySize: 1825, zSize: 1585, xInSize: 2660, brand: "현대", no: 4361 },
  { name: "코나EV (2024)", xSize: 4385, ySize: 1825, zSize: 1580, xInSize: 2660, brand: "현대", no: 4510 },
  { name: "투싼 (2025/24)", xSize: 4640, ySize: 1865, zSize: 1665, xInSize: 2755, brand: "현대", no: 4592 },
  { name: "아이오닉5 (2024)", xSize: 4655, ySize: 1890, zSize: 1605, xInSize: 3000, brand: "현대", no: 4624 },
  { name: "넥쏘 (2024)", xSize: 4670, ySize: 1860, zSize: 1630, xInSize: 2790, brand: "현대", no: 3564 },
  { name: "싼타페 (2025/24)", xSize: 4830, ySize: 1900, zSize: 1770, xInSize: 2815, brand: "현대", no: 4435 },
  { name: "펠리세이드 (2025)", xSize: 5065, ySize: 1980, zSize: 1805, xInSize: 2970, brand: "현대", no: 4699 },
  { name: "아이오닉9 (2025)", xSize: 5060, ySize: 1980, zSize: 1790, xInSize: 3130, brand: "현대", no: 4088 },
  { name: "스타리아 (2026)", xSize: 5255, ySize: 1995, zSize: 1990, xInSize: 3275, brand: "현대", no: 4765 },
  { name: "아토3 (2025)", xSize: 4455, ySize: 1875, zSize: 1615, xInSize: 2720, brand: "BYD", no: 4702 },
  { name: "씰 (2025)", xSize: 4800, ySize: 1875, zSize: 1460, xInSize: 2920, brand: "BYD", no: 4703 },
  { name: "씨라이언7 (2025)", xSize: 4830, ySize: 1925, zSize: 1620, xInSize: 2930, brand: "BYD", no: 4706 },
  { name: "모닝 (2024/23)", xSize: 3595, ySize: 1595, zSize: 1485, xInSize: 2400, brand: "기아", no: 4554 },
  { name: "레이 (2025/24/23)", xSize: 3595, ySize: 1595, zSize: 1700, xInSize: 2520, brand: "기아", no: 4689 },
  { name: "레이EV (2025/24)", xSize: 3595, ySize: 1595, zSize: 1710, xInSize: 2520, brand: "기아", no: 4691 },
  { name: "EV4 (2025)", xSize: 4730, ySize: 1860, zSize: 1480, xInSize: 2820, brand: "기아", no: 4712 },
  { name: "K5 (2025/24)", xSize: 4905, ySize: 1860, zSize: 1445, xInSize: 2850, brand: "기아", no: 4585 },
  { name: "K8 (2025)", xSize: 5050, ySize: 1880, zSize: 1480, xInSize: 2895, brand: "기아", no: 4665 },
  { name: "K9 (2025/24/23/22)", xSize: 5140, ySize: 1915, zSize: 1490, xInSize: 3105, brand: "기아", no: 4066 },
  { name: "셀토스 (2025/24/23)", xSize: 4390, ySize: 1800, zSize: 1620, xInSize: 2630, brand: "기아", no: 4391 },
  { name: "니로하이브리드 (2026)", xSize: 4430, ySize: 1825, zSize: 1550, xInSize: 2720, brand: "기아", no: 4775 },
  { name: "니로EV (2025)", xSize: 4420, ySize: 1825, zSize: 1570, xInSize: 2720, brand: "기아", no: 4396 },
  { name: "EV3 (2025/24)", xSize: 4310, ySize: 1850, zSize: 1570, xInSize: 2680, brand: "기아", no: 4647 },
  { name: "EV6 (2025)", xSize: 4695, ySize: 1890, zSize: 1550, xInSize: 2900, brand: "기아", no: 4641 },
  { name: "스포티지 (2025)", xSize: 4685, ySize: 1865, zSize: 1680, xInSize: 2755, brand: "기아", no: 4684 },
  { name: "EV9 (2025/24)", xSize: 5010, ySize: 1980, zSize: 1755, xInSize: 3100, brand: "기아", no: 4128 },
  { name: "쏘렌토 (2025/24)", xSize: 4815, ySize: 1900, zSize: 1700, xInSize: 2815, brand: "기아", no: 4563 },
  { name: "카니발 (2025)", xSize: 5155, ySize: 1995, zSize: 1785, xInSize: 3090, brand: "기아", no: 4586 },
  { name: "타스만 (2025)", xSize: 5410, ySize: 1930, zSize: 1870, xInSize: 3270, brand: "기아", no: 4686 },
  { name: "봉고3 (2025/24/22/20)", xSize: 5125, ySize: 1740, zSize: 1995, xInSize: 2615, brand: "기아", no: 3772 },
  { name: "모델3 (2024)", xSize: 4720, ySize: 1935, zSize: 1440, xInSize: 2875, trunk: 649, brand: "테슬라", no: 4610 },
  { name: "모델Y (2024)", xSize: 4750, ySize: 1980, zSize: 1625, xInSize: 2890, trunk: 854, brand: "테슬라", no: 3687 },
  { name: "모델Y주니퍼 (2025)", xSize: 4790, ySize: 1980, zSize: 1625, xInSize: 2890, brand: "테슬라", no: 4667 },
  { name: "모델X (2023)", xSize: 5057, ySize: 1999, zSize: 1680, xInSize: 2965, brand: "테슬라", no: 4027 },
  { name: "사이버트럭 (2024)", xSize: 5683, ySize: 2032, zSize: 1791, xInSize: 3635, brand: "테슬라", no: 3825 },
  { name: "G70 (2023)", xSize: 4685, ySize: 1850, zSize: 1400, xInSize: 2835, brand: "제네시스", no: 3995 },
  { name: "G80 (2025/24)", xSize: 5005, ySize: 1925, zSize: 1465, xInSize: 3010, brand: "제네시스", no: 4603 },
  { name: "G80EV (2025)", xSize: 5135, ySize: 1925, zSize: 1480, xInSize: 3140, brand: "제네시스", no: 4660 },
  { name: "G90 (2025)", xSize: 5275, ySize: 1930, zSize: 1490, xInSize: 3180, brand: "제네시스", no: 4016 },
  { name: "GV60 (2025)", xSize: 4545, ySize: 1890, zSize: 1580, xInSize: 2900, brand: "제네시스", no: 4701 },
  { name: "GV70 (2025)", xSize: 4715, ySize: 1910, zSize: 1630, xInSize: 2875, brand: "제네시스", no: 4609 },
  { name: "GV80 (2025)", xSize: 4940, ySize: 1975, zSize: 1715, xInSize: 2955, brand: "제네시스", no: 4465 },
  { name: "그랑콜레오스 (2025)", xSize: 4780, ySize: 1880, zSize: 1705, xInSize: 2820, brand: "르노", no: 4659 },
  { name: "QM6 (2026/25/24)", xSize: 4675, ySize: 1845, zSize: 1700, xInSize: 2705, brand: "르노", no: 4483 },
  { name: "아르카나 (2026/25)", xSize: 4570, ySize: 1820, zSize: 1570, xInSize: 2720, trunk: 487, brand: "르노", no: 4560 },
  { name: "SM6 (2025/24/23/22)", xSize: 4855, ySize: 1870, zSize: 1460, xInSize: 2810, brand: "르노", no: 3979 },
  { name: "티볼리 (2024)", xSize: 4225, ySize: 1810, zSize: 1620, xInSize: 2600, brand: "KGM", no: 4545 },
  { name: "코란도 (2024)", xSize: 4450, ySize: 1870, zSize: 1630, xInSize: 2675, brand: "KGM", no: 3635 },
  { name: "토레스 (2027)", xSize: 4705, ySize: 1890, zSize: 1720, xInSize: 2680, brand: "KGM", no: 4807 },
  { name: "토레스EVX (2025/24)", xSize: 4715, ySize: 1890, zSize: 1745, xInSize: 2680, trunk: 839, brand: "KGM", no: 4492 },
  { name: "액티언 (2025)", xSize: 4740, ySize: 1910, zSize: 1680, xInSize: 2680, brand: "KGM", no: 4622 },
  { name: "렉스턴 (2025/24)", xSize: 4850, ySize: 1960, zSize: 1825, xInSize: 2865, brand: "KGM", no: 4518 },
  { name: "무쏘스포츠 (2025)", xSize: 5105, ySize: 1950, zSize: 1870, xInSize: 3100, brand: "KGM", no: 4716 },
  { name: "무쏘칸 (2025)", xSize: 5415, ySize: 1950, zSize: 1885, xInSize: 3210, brand: "KGM", no: 4717 },
  { name: "무쏘EV (2025)", xSize: 5160, ySize: 1920, zSize: 1740, xInSize: 3150, brand: "KGM", no: 4666 },
  { name: "트랙스크로스오버 (2025)", xSize: 4540, ySize: 1825, zSize: 1560, xInSize: 2700, brand: "쉐보레", no: 4429 },
  { name: "트레일블레이저 (2025)", xSize: 4425, ySize: 1810, zSize: 1670, xInSize: 2640, brand: "쉐보레", no: 4474 },
  { name: "올란도 (2019)", xSize: 4665, ySize: 1835, zSize: 1635, xInSize: 2760, brand: "쉐보레", no: 2140 },
  { name: "폴레스타2 (2025)", xSize: 4605, ySize: 1860, zSize: 1480, xInSize: 2735, brand: "폴스타", no: 4468 },
  { name: "폴레스타4 (2025)", xSize: 4840, ySize: 2008, zSize: 1534, xInSize: 2999, brand: "폴스타", no: 4513 },
  { name: "우라칸 (2023)", xSize: 4520, ySize: 1933, zSize: 1165, xInSize: 2620, brand: "람보르기니", no: 3746 },
  { name: "우루스 (2022)", xSize: 5113, ySize: 2017, zSize: 1638, xInSize: 3002, brand: "람보르기니", no: 3526 },
  { name: "카이엔 (2026/25)", xSize: 4930, ySize: 1983, zSize: 1696, xInSize: 2895, brand: "포르쉐", no: 4506 },
  { name: "미니쿠퍼 (2026/25)", xSize: 3875, ySize: 1745, zSize: 1450, xInSize: 2495, brand: "BMW Mini", no: 4618 },
  { name: "ID.4 (2025)", xSize: 4585, ySize: 1850, zSize: 1615, xInSize: 2765, brand: "폭스바겐", no: 4005 },
  { name: "ID.5 (2025)", xSize: 4600, ySize: 1850, zSize: 1620, xInSize: 2765, brand: "폭스바겐", no: 4121 },
  { name: "골프 (2026)", xSize: 4290, ySize: 1790, zSize: 1450, xInSize: 2631, brand: "폭스바겐", no: 4720 },
  { name: "돌핀 (2026)", xSize: 4290, ySize: 1770, zSize: 1570, xInSize: 2700, brand: "BYD", no: 4704 },
  { name: "아이오닉6 (2026)", xSize: 4925, ySize: 1880, zSize: 1495, xInSize: 2950, brand: "현대", no: 4746 },
  { name: "아이오닉6N (2026)", xSize: 4935, ySize: 1940, zSize: 1495, xInSize: 2965, brand: "현대", no: 4742 },
  { name: "스타리아EV (2026)", xSize: 5255, ySize: 1995, zSize: 1990, xInSize: 3275, brand: "현대", no: 4770 },
  { name: "셀토스 (2026)", xSize: 4430, ySize: 1830, zSize: 1615, xInSize: 2690, brand: "기아", no: 4763 },
  { name: "PV5 (2027/26)", xSize: 4695, ySize: 1895, zSize: 1905, xInSize: 2995, brand: "기아", no: 4714 },
  { name: "GV70EV (2027)", xSize: 4715, ySize: 1910, zSize: 1630, xInSize: 2875, brand: "제네시스", no: 4705 },
  { name: "무쏘 (2026)", xSize: 5150, ySize: 1950, zSize: 1865, xInSize: 3100, brand: "KGM", no: 4766 },
  { name: "일렉트릭GLC (2027)", xSize: 4845, ySize: 1913, zSize: 1644, xInSize: 2972, brand: "벤츠", no: 4752 },
  { name: "iX3 (2026)", xSize: 4782, ySize: 1895, zSize: 1635, xInSize: 2897, brand: "BMW", no: 4751 },
  { name: "XC60 (2026)", xSize: 4710, ySize: 1900, zSize: 1645, xInSize: 2865, brand: "볼보", no: 4747 },
  { name: "XC90 (2026)", xSize: 4955, ySize: 1960, zSize: 1765, xInSize: 2984, brand: "볼보", no: 4737 },
  { name: "EX30크로스컨트리 (2027)", xSize: 4233, ySize: 1850, zSize: 1573, xInSize: 2650, brand: "볼보", no: 4750 },
  { name: "EX40", xSize: 4440, ySize: 1873, zSize: 1647, xInSize: 2702, brand: "볼보", no: 4731 },
  { name: "ES90 (2027)", xSize: 5000, ySize: 1942, zSize: 1550, xInSize: 3102, brand: "볼보", no: 4756 },
  { name: "Q3 (2026)", xSize: 4530, ySize: 1860, zSize: 1585, xInSize: 2681, brand: "아우디", no: 4774 },
  { name: "Q5 (2026/25)", xSize: 4715, ySize: 1900, zSize: 1650, xInSize: 2820, brand: "아우디", no: 4736 },
  { name: "Q6 e-tron (2026/25)", xSize: 4770, ySize: 1965, zSize: 1690, xInSize: 2888, brand: "아우디", no: 4690 },
  { name: "A6 (2026)", xSize: 5005, ySize: 1875, zSize: 1460, xInSize: 2923, brand: "아우디", no: 4773 },
  { name: "e-tron GT (2026/25)", xSize: 5005, ySize: 1965, zSize: 1390, xInSize: 2900, brand: "아우디", no: 4759 },
  { name: "카이엔EV (2026)", xSize: 4985, ySize: 1980, zSize: 1674, xInSize: 3023, brand: "포르쉐", no: 4762 },
  { name: "3008 (2026/25)", xSize: 4545, ySize: 1895, zSize: 1650, xInSize: 2730, brand: "푸조", no: 4741 },
  { name: "넥쏘 (2027/26)", xSize: 4750, ySize: 1865, zSize: 1675, xInSize: 2790, brand: "현대", no: 4677 },
  { name: "EV5 (2026)", xSize: 4610, ySize: 1875, zSize: 1680, xInSize: 2750, brand: "기아", no: 4499 },
  { name: "포터2 (2026)", xSize: 5100, ySize: 1740, zSize: 1970, xInSize: 2640, brand: "현대", no: 1901 },
];
