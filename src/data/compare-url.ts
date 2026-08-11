import { CARS, type Car } from "./cars";

/**
 * 비교 URL — `/compare/쏘렌토-vs-싼타페`
 *
 * 한글 그대로 쓴다. 검색어와 글자가 같아야 검색결과에서 유리하고, 주소창에 붙여넣어도
 * 브라우저가 알아서 읽어준다. 연식은 뺀다 — 검색하는 사람은 "쏘렌토 싼타페"라고만 친다.
 */
export const carSlug = (car: Car) => car.name.split(" (")[0].replace(/\s+/g, "");

export const comparePath = (a: Car, b: Car) => `/compare/${carSlug(a)}-vs-${carSlug(b)}`;

/** URL에서 두 차를 되찾는다. 못 찾으면 null — 없는 조합으로 들어와도 앱이 죽지 않게. */
export function parseComparePath(pathname: string): [Car, Car] | null {
  const match = decodeURIComponent(pathname).match(/^\/compare\/(.+?)-vs-(.+?)\/?$/);
  if (!match) return null;

  const find = (slug: string) => CARS.find((c) => carSlug(c) === slug) ?? null;
  const [a, b] = [find(match[1]), find(match[2])];
  return a && b ? [a, b] : null;
}
