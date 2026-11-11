import React, { useState } from 'react';
import { CalendarRange, History, Share2, Leaf, RotateCcw, ShieldCheck, FileEdit, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/store.js';
import { useDerived } from '../store/derived.js';
import { QUARTERS, YEAR, IMPORTERS, NEW_IMPORTER } from '../data/seed.js';
import { periodHasData, delay } from '../lib/calc.js';
import { Button, Card, PageHeader, Badge, cx } from '../components/ui.jsx';

const ST = { draft: { tone: 'amber', label: 'Draft', icon: FileEdit }, validated: { tone: 'blue', label: 'Validated', icon: ShieldCheck }, shared: { tone: 'green', label: 'Shared', icon: Share2 } };
const MONTHS = { Q1: 'Jan – Mar', Q2: 'Apr – Jun', Q3: 'Jul – Sep', Q4: 'Oct – Dec' };

export default function Periods() {
  const { periods, data, go, revisePeriod, connections, toast } = useStore();
  const { status, issues } = useDerived();
  const [busy, setBusy] = useState(null);
  const validate = async (q) => { setBusy(q); await delay(700, 1000); setBusy(null); const n = issues.filter((i) => i.q === q).length; toast(n ? `${q}: ${n} issue(s) still open` : `${q} ${YEAR} passes all checks`, n ? 'info' : 'ok'); };
  const names = (q) => Object.values(connections).filter((c) => c.periods.includes(q)).map((c) => (c.importerId === 'nordic' ? NEW_IMPORTER : IMPORTERS.find((i) => i.id === c.importerId)).short);

  return (
    <div>
      <PageHeader eyebrow="Deliver" title={`Reporting periods ${YEAR}`} desc="Each quarter moves from draft to validated to shared. Every change creates a new version, so importers always know which dataset they hold." />
      <div className="grid md:grid-cols-2 gap-5">
        {QUARTERS.map((q) => {
          const p = periods[q];
          const s = ST[status[q]];
          const has = periodHasData(data, q);
          const open = issues.filter((i) => i.q === q).length;
          return (
            <Card key={q} className="p-6 animate-rise">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sea-50 text-sea-700 flex items-center justify-center font-semibold text-lg">{q}</div>
                  <div><div className="font-semibold text-lg">{q} {YEAR}</div><div className="text-xs text-ink-500">{MONTHS[q]}</div></div>
                </div>
                <div className="text-right"><Badge tone={s.tone} icon={s.icon}>{s.label}</Badge><div className="text-xs text-ink-500 mt-1.5 num">{p.version ? `Version v${p.version}` : 'No version yet'}</div></div>
              </div>
              <div className="mt-4 text-sm text-ink-700 min-h-[22px]">
                {!has ? <span className="text-ink-400">No data imported yet.</span> : open ? <span className="text-red-600">{open} open validation issue{open > 1 ? 's' : ''}</span> : status[q] === 'shared' ? <span>Shared with {names(q).join(', ')}</span> : <span className="text-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Ready to share</span>}
              </div>
              <div className="mt-4 rounded-xl bg-ink-50 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-500 mb-2"><History className="w-3.5 h-3.5" /> Version history</div>
                {p.history.length ? (
                  <ol className="space-y-2 max-h-36 overflow-y-auto">
                    {p.history.map((h, i) => (
                      <li key={i} className="flex gap-3 text-[13px] animate-rise"><span className="num text-xs font-semibold text-sea-700 bg-sea-50 rounded px-1.5 py-0.5 h-fit">v{h.v}</span><span className="flex-1 text-ink-700">{h.text}</span><span className="text-xs text-ink-400 whitespace-nowrap">{h.at}</span></li>
                    ))}
                  </ol>
                ) : <div className="text-sm text-ink-400">History appears after the first import.</div>}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {!has ? <Button size="sm" onClick={() => go('import')}>Import data</Button> : <>
                  <Button size="sm" variant="secondary" icon={ShieldCheck} loading={busy === q} onClick={() => validate(q)}>Validate</Button>
                  <Button size="sm" variant="secondary" icon={Leaf} onClick={() => go('results')}>Results</Button>
                  {status[q] === 'draft' ? <Button size="sm" onClick={() => go('validation')}>Resolve issues</Button> : <Button size="sm" icon={Share2} onClick={() => go('sharing')}>{status[q] === 'shared' ? 'Manage sharing' : 'Share'}</Button>}
                  {status[q] !== 'draft' && <Button size="sm" variant="ghost" icon={RotateCcw} onClick={() => revisePeriod(q)}>New version</Button>}
                </>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
