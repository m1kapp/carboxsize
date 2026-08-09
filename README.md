# Car Box Size

차를 상자로 바꿔서 크기를 비교합니다.

- **공간** = 축거 × 전폭 × 전고 (m³) — 실내로 쓸 수 있는 부피
- **외형** = 전장 × 전폭 × 전고 (m³) — 주차장에서 차지하는 부피

카드마다 실제 치수 비율로 만든 3D 상자를 차 사진 위에 겹쳐 보여줍니다.
기준자로 `성인사람`(500×500×1700)과 `주차장`(5000×2300×300)이 목록에 함께 들어 있습니다.

## 화면

| 탭 | 하는 일 |
|---|---|
| 전체보기 | 76종을 공간·외형·축거·전장·전고·전폭 기준으로 정렬. 같은 버튼을 다시 누르면 오름/내림 전환 |
| 비교하기 | 두 대를 골라 6개 항목의 차이를 문장으로. `랜덤` 버튼으로 아무 두 대 |

## 개발

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## 스택

Vite · React 19 · TypeScript · Tailwind 4 · [`@m1kapp/kit`](https://github.com/m1kapp/kit)

차량 이미지는 다나와(`autoimg.danawa.com`)의 모델 이미지를 참조합니다.

## 데이터 추가

`src/data/cars.ts`의 `CARS` 배열에 한 줄 추가하면 끝입니다.

```ts
{ name: "모델명 (2025)", xSize: 4710, ySize: 1825, zSize: 1420, xInSize: 2720, brand: "현대", no: 4455 },
```

`no`는 다나와 모델 번호로, `https://autoimg.danawa.com/photo/{no}/model_360.png` 이미지를 가리킵니다.
