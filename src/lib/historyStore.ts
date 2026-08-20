import type { ScreeningRecord } from './types';

const STORAGE_KEY = 'sukriva_screening_history_v2';
const TREND_KEY = 'sukriva_ats_trend_v2';

export function loadHistory(): ScreeningRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScreeningRecord[];
  } catch {
    return [];
  }
}

export function saveHistory(entries: ScreeningRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 50)));
  updateTrendChart(entries);
}

export function addHistoryEntry(entry: ScreeningRecord) {
  const next = [entry, ...loadHistory()].slice(0, 50);
  saveHistory(next);
  return next;
}

export function removeHistoryEntry(id: string) {
  const next = loadHistory().filter((e) => e.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TREND_KEY);
}

/** Fixed updateTrendChart — builds chronological ATS trend points for charts */
export function updateTrendChart(entries?: ScreeningRecord[]): Array<{ label: string; score: number }> {
  const list = entries ?? loadHistory();
  const points = [...list]
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-12)
    .map((e) => ({
      label: new Date(e.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      score: e.analysis?.atsScore ?? 0,
    }));

  try {
    localStorage.setItem(TREND_KEY, JSON.stringify(points));
  } catch {
    /* ignore quota errors */
  }

  return points;
}

export function loadTrendChart(): Array<{ label: string; score: number }> {
  try {
    const raw = localStorage.getItem(TREND_KEY);
    if (raw) return JSON.parse(raw) as Array<{ label: string; score: number }>;
  } catch {
    /* fall through */
  }
  return updateTrendChart();
}
