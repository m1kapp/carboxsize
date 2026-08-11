/**
 * 다나와 자동차에서 제원·판매실적을 읽어오는 공통 유틸.
 *
 * 이 사이트의 데이터는 전부 다나와가 출처다. 페이지가 서버 렌더라 HTML을 그대로 파싱한다.
 * API가 아니라 화면을 긁는 것이므로, 마크업이 바뀌면 파서가 조용히 빈 값을 내놓는다.
 * 그래서 각 파서는 "못 찾았으면 null"을 돌려주고, 호출부가 개수를 검사하도록 했다.
 */

const BASE = "https://auto.danawa.com/auto/";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

/** 다나와가 붙는 대로 몰아치면 막히므로 동시 요청 수를 묶어서 보낸다. */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

async function get(params, { retries = 2 } = {}) {
  const url = `${BASE}?${new URLSearchParams(params)}`;
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt >= retries) throw new Error(`${url} — ${err.message}`);
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

const SPEC_FIELDS = { 전장: "xSize", 전폭: "ySize", 전고: "zSize", 축거: "xInSize" };
/** 기계식 주차 판정에 쓰는 무게. 단위가 kg이라 mm 파서와 따로 읽는다. */
const WEIGHT_LABEL = "공차중량";

/**
 * 모델 제원. 트림마다 값이 갈리는 항목(휠 크기에 따른 전고 등)은 최빈값을 쓴다.
 * @returns {Promise<{xSize:number,ySize:number,zSize:number,xInSize:number, all:object}|null>}
 */
export async function fetchSpec(no) {
  const html = await get({ Work: "model", Model: no, Tab: "spec" });
  const labels = [...html.matchAll(/leftTr' id='compareLeft_(\d+)'>\s*<td>([^<]*)<\/td>/g)];

  const spec = {};
  const all = {};
  for (const [, index, label] of labels) {
    const key = SPEC_FIELDS[label];
    if (!key) continue;
    const row = html.match(new RegExp(`rightTr' id='compareRight_${index}'>([\\s\\S]*?)<\\/tr>`));
    if (!row) continue;
    const values = [...row[1].matchAll(/>([\d,]+)\s*mm</g)].map((m) => Number(m[1].replace(/,/g, "")));
    if (!values.length) continue;
    all[key] = [...new Set(values)].sort((a, b) => a - b);
    spec[key] = mode(values);
  }

  // 공차중량은 트림마다 갈린다(구동방식·배터리). 기계식 주차는 못 들어가면 그만이라
  // 대표값이 아니라 가장 무거운 트림을 쓴다.
  let weight = null;
  const weightRow = labels.find(([, , label]) => label === WEIGHT_LABEL);
  if (weightRow) {
    const row = html.match(new RegExp(`rightTr' id='compareRight_${weightRow[1]}'>([\\s\\S]*?)<\\/tr>`));
    if (row) {
      const values = [...row[1].matchAll(/>([\d,]+)\s*kg</g)].map((m) => Number(m[1].replace(/,/g, "")));
      if (values.length) weight = Math.max(...values);
    }
  }

  return Object.keys(SPEC_FIELDS).every((label) => spec[SPEC_FIELDS[label]] != null)
    ? { ...spec, weight, all }
    : null;
}

/** 모델의 판매 연식 라벨 — [2026, 2025] -> "2026/25". 트림이 없으면 null. */
export async function fetchYears(no) {
  const html = await get({ Work: "model", Model: no });
  const years = [...new Set([...html.matchAll(/trimName='(20\d\d)년형/g)].map((m) => Number(m[1])))]
    .sort((a, b) => b - a);
  if (!years.length) return null;
  return [String(years[0]), ...years.slice(1).map((y) => String(y).slice(2))].join("/");
}

/** 모델명·제조사 (keywords 메타에 제조사가 먼저 온다) */
export async function fetchModelInfo(no) {
  const html = await get({ Work: "model", Model: no });
  return {
    title: html.match(/<title>\s*(.*?)\s*종합정보/)?.[1] ?? null,
    brand: html.match(/name='keywords' content='([^,]+),/)?.[1]?.trim() ?? null,
  };
}

/**
 * 월별 모델 판매량. brand를 주면 그 브랜드만 — 다나와는 수입차를 브랜드별로만 내려준다.
 * @returns {Promise<Record<number, {name: string, units: number}>>}
 */
export async function fetchSales(month, brand) {
  const html = await get({
    Work: "record",
    Tab: "Model",
    Month: `${month}-00`,
    MonthTo: "",
    ...(brand ? { Brand: brand } : {}),
  });

  const rows = {};
  const re = /value='record_(\d+)' title='([^']*)'[\s\S]*?class='rank'>(\d+)<[\s\S]*?class='num'>([\d,]+)/g;
  for (const m of html.matchAll(re)) {
    rows[Number(m[1])] = { name: m[2], units: Number(m[4].replace(/,/g, "")) };
  }
  return rows;
}

function mode(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}
