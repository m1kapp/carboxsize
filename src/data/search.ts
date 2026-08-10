const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;

/** 한글 음절을 초성으로 — "셀토스" -> "ㅅㅌㅅ". 한글이 아니면 그대로 둔다. */
function toChoseong(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    out += code >= HANGUL_BASE && code <= HANGUL_LAST
      ? CHO[Math.floor((code - HANGUL_BASE) / 588)]
      : ch;
  }
  return out;
}

const normalize = (s: string) => s.toLowerCase().replace(/[\s.-]/g, "");

/** 초성만으로 이루어진 질의인지 — "ㅅㅌㅅ"는 초성 검색, "셀토"는 일반 검색 */
const isChoseongQuery = (q: string) => /^[ㄱ-ㅎ]+$/.test(q.replace(/\s/g, ""));

/**
 * 이름·브랜드를 부분일치로 찾는다. 질의가 초성만이면 초성끼리 비교한다.
 * "ev" -> EV3/EV6, "ㅅㅌㅅ" -> 셀토스, "기아" -> 기아 전 차종.
 */
export function matchesQuery(query: string, ...fields: (string | undefined)[]): boolean {
  const q = normalize(query);
  if (!q) return true;
  const cho = isChoseongQuery(q);
  return fields.some((f) => {
    if (!f) return false;
    const target = normalize(f);
    return cho ? toChoseong(target).includes(q) : target.includes(q);
  });
}
