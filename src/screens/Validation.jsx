import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, CheckCircle2, Wand2, PenLine, ScanSearch, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../store/store.js';
import { useDerived } from '../store/derived.js';
import { QUARTERS } from '../data/seed.js';
import { flatProducts, cellStatus, delay } from '../lib/calc.js';
import { Button, Card, PageHeader, Badge, Ring, Skeleton, Empty, cx, Help, Tip } from '../components/ui.jsx';

const SEV = { error: { tone: 'red', label: 'Error', icon: AlertOctagon }, warning: { tone: 'amber', label: 'Warning', icon: AlertTriangle } };
const CELL = { ok: 'bg-emerald-100 text-emerald-700', warning: 'bg-amber-100 text-amber-700', error: 'bg-red-100 text-red-700', empty: 'bg-ink-100 text-ink-400' };

export default function Validation() {
  const { imported, hierarchy, data, resolved, applyFix, fixAll, go, ensureStage, toast, timers } = useStore();
  const { issues, score } = useDerived();
  const [fixing, setFixing] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [flash, setFlash] = useState(null);

  if (!imported) return <Empty icon={ShieldCheck} title="Nothing to validate yet" text="Import your spreadsheet first. Validation runs automatically on every dataset." action={<><Button onClick={() => go('import')}>Go to import</Button><Button variant="secondary" onClick={() => ensureStage('imported')}>Skip (demo)</Button></>} />;

  const prods = flatProducts(hierarchy);
  const fixOne = async (i) => {
    setFixing((f) => [...f, i.id]);
    await delay(650, 950);
    applyFix(i.id); setFlash(i.id);
    setFixing((f) => f.filter((x) => x !== i.id));
    setTimeout(() => setFlash(null), 1500);
  };
  const doFixAll = async () => {
    const todo = issues.filter((i) => i.fix);
    for (const i of todo) await fixOne(i);
    toast('All auto-fixable issues resolved');
  };
  const rescan = async () => { setScanning(true); await delay(800, 1100); setScanning(false); toast(issues.length ? `${issues.length} open issues` : 'No issues found. Quality score 100%', issues.length ? 'info' : 'ok'); };
  const done = issues.length === 0;
  const secs = timers.importAt && timers.readyAt && timers.readyAt - timers.importAt >= 5000 ? Math.round((timers.readyAt - timers.importAt) / 1000) : null;

  return (
    <div>
      <PageHeader eyebrow="Data" title="Validation" desc="Completeness checks and anomaly detection run on every dataset. Fix what is flagged, then share with confidence."
        actions={<><Button variant="secondary" icon={ScanSearch} loading={scanning} onClick={rescan}>Run validation</Button>
          <Button icon={Wand2} disabled={!issues.some((i) => i.fix) || fixing.length > 0} data-tour="fix-all" onClick={doFixAll}>Fix all ({issues.filter((i) => i.fix).length})</Button></>} />

      {done && (
        <Card className="mb-5 p-5 bg-gradient-to-r from-emerald-50 to-sea-50 border-emerald-100 flex flex-wrap items-center gap-4 animate-pop">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center"><Sparkles className="w-6 h-6" /></div>
          <div className="flex-1 min-w-[240px]"><div className="font-semibold text-lg">100%: every period is validated and ready to share</div><div className="text-sm text-ink-500">{secs != null ? `From import to a ready dataset in ${secs < 90 ? `${secs} seconds` : `${Math.round(secs / 60)} minutes`} in this demo run.` : 'Quarterly datasets are validated.'}</div></div>
          <Button variant="secondary" onClick={() => go('results')}>See emissions</Button><Button iconRight={ArrowRight} onClick={() => go('sharing')}>Share with importers</Button>
        </Card>
      )}

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        <div className="space-y-5">
          <Card className="p-6 flex flex-col items-center animate-rise">
            <div className="label mb-3 flex items-center gap-1.5">Data-quality score <Help k="quality" /></div>
            {scanning ? <Skeleton className="w-[140px] h-[140px] !rounded-full" /> : <Ring value={score} size={140} stroke={12} />}
            <div className="mt-4 flex gap-2 text-xs"><Badge tone="red">{issues.filter((i) => i.severity === 'error').length} errors</Badge><Badge tone="amber">{issues.filter((i) => i.severity === 'warning').length} warnings</Badge><Badge tone="green">{resolved.length} fixed</Badge></div>
          </Card>
          <Card className="p-5 animate-rise">
            <div className="label mb-3">Completeness by product and period</div>
            <div className="grid grid-cols-[1fr_repeat(4,36px)] gap-1.5 items-center text-xs">
              <div />{QUARTERS.map((q) => <div key={q} className="text-center text-ink-500">{q}</div>)}
              {prods.filter((p) => ['bolts', 'wirerod', 'rebar'].includes(p.id) || Object.keys(data).some((k) => k.startsWith(p.id))).map((p) => (
                <React.Fragment key={p.id}>
                  <div className="truncate text-ink-700">{p.name}</div>
                  {QUARTERS.map((q) => {
                    const st = cellStatus(issues, p.id, q, data);
                    const Ic = st === 'ok' ? CheckCircle2 : st === 'empty' ? null : AlertTriangle;
                    return <Tip key={q} text={`${p.name} ${q}: ${st === 'ok' ? 'valid' : st === 'empty' ? 'no data' : issues.find((i) => i.productId === p.id && i.q === q)?.title}`}><button onClick={() => go('entry', { pid: p.id, q })} className={cx('w-9 h-9 rounded-lg flex items-center justify-center transition hover:scale-110', CELL[st])}>{Ic && <Ic className="w-4 h-4" />}</button></Tip>;
                  })}
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          {scanning && [0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)}
          {!scanning && issues.map((i) => {
            const S = SEV[i.severity];
            const busy = fixing.includes(i.id);
            return (
              <Card key={i.id} className={cx('p-5 animate-rise border-l-4', i.severity === 'error' ? '!border-l-red-400' : '!border-l-amber-400')}>
                <div className="flex items-start gap-4">
                  <div className={cx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', i.severity === 'error' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600')}><S.icon className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{i.title}</span><Badge tone={S.tone}>{S.label}</Badge><Badge tone="slate">{i.productName} · {i.q} 2026</Badge></div>
                    <p className="text-sm text-ink-500 mt-1.5 leading-relaxed">{i.detail}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {i.fix ? <Button size="sm" icon={Wand2} loading={busy} onClick={() => fixOne(i)}>{busy ? 'Fixing…' : i.fixLabel}</Button> : <span className="text-xs text-ink-400">No automatic fix</span>}
                      <Button size="sm" variant="secondary" icon={PenLine} onClick={() => go('entry', { pid: i.productId, q: i.q })}>Edit manually</Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          {resolved.map((r) => (
            <Card key={r.id} className={cx('p-4 flex items-center gap-3 bg-emerald-50/40 border-emerald-100', flash === r.id && 'animate-flash')}>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0"><div className="text-sm font-medium line-through decoration-emerald-300 text-ink-500">{r.title}</div><div className="text-xs text-ink-500">{r.productName} · {r.q} 2026 · {r.fixLabel}</div></div>
              <Badge tone="green">Resolved</Badge>
            </Card>
          ))}
          {!scanning && !issues.length && !resolved.length && <Card className="p-10 text-center text-ink-500">No issues. Everything checks out.</Card>}
        </div>
      </div>
    </div>
  );
}
