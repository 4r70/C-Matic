import { useMemo } from 'react';
import { useStore } from './store.js';
import { detectIssues, scoreFrom, periodHasData } from '../lib/calc.js';

export function useDerived() {
  const data = useStore((s) => s.data);
  const hierarchy = useStore((s) => s.hierarchy);
  const periods = useStore((s) => s.periods);
  return useMemo(() => {
    const issues = detectIssues(data, hierarchy);
    const score = scoreFrom(issues, data);
    const status = {};
    ['Q1', 'Q2', 'Q3', 'Q4'].forEach((q) => {
      status[q] = periods[q].shared ? 'shared' : periodHasData(data, q) && !issues.some((i) => i.q === q) ? 'validated' : 'draft';
    });
    const validated = Object.keys(status).filter((q) => status[q] !== 'draft');
    return { issues, score, status, validated };
  }, [data, hierarchy, periods]);
}
