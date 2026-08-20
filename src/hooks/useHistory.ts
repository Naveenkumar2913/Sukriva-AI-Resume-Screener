import { useCallback, useEffect, useState } from 'react';
import type { ScreeningRecord } from '../lib/types';
import {
  addHistoryEntry,
  clearHistory as clearStore,
  loadHistory,
  removeHistoryEntry,
  updateTrendChart,
  loadTrendChart,
} from '../lib/historyStore';

export function useHistory() {
  const [history, setHistory] = useState<ScreeningRecord[]>([]);
  const [trend, setTrend] = useState<Array<{ label: string; score: number }>>([]);

  const refresh = useCallback(() => {
    const entries = loadHistory();
    setHistory(entries);
    setTrend(loadTrendChart());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback((entry: ScreeningRecord) => {
    const next = addHistoryEntry(entry);
    setHistory(next);
    setTrend(updateTrendChart(next));
  }, []);

  const removeEntry = useCallback((id: string) => {
    const next = removeHistoryEntry(id);
    setHistory(next);
    setTrend(updateTrendChart(next));
  }, []);

  const clearHistory = useCallback(() => {
    clearStore();
    setHistory([]);
    setTrend([]);
  }, []);

  return { history, trend, addEntry, removeEntry, clearHistory, refresh };
}
