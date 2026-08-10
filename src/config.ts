/**
 * 사이트 전역 설정. 색·slug 같은 값을 컴포넌트에 박아두지 않고 여기서만 고친다.
 * 빌드 스크립트(scripts/)도 이 파일을 읽으므로 값의 출처가 하나로 유지된다.
 */
export const SITE = {
  name: "Car Box Size",
  url: "https://carboxsize.m1k.app",
  description: "차를 상자로 바꿔서 크기를 비교합니다.",

  /** 브랜드 기준색. 앱 accent·파비콘·theme-color가 전부 이 값에서 나온다. */
  accent: "#2563eb",

  tracker: {
    /** npx m1kkit track 으로 발급받은 slug. Vite라 env를 kit이 못 읽어서 prop으로 넘긴다. */
    slug: "gG",
    /** m1k.app 계정 귀속 여부. scripts/check-claim.mjs 가 실제 상태를 확인해 갱신한다. */
    claimed: true,
  },
} as const;
