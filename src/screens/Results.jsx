import React, { useState } from 'react';
import { Leaf, Lock, ArrowRight, FlaskConical, Info, ChevronDown } from 'lucide-react';
import { useStore } from '../store/store.js';
import { useDerived } from '../store/derived.js';
import { QUARTERS, YEAR } from '../data/seed.js';
import { flatProducts, calc, fmt, hasAnyData } from '../lib/calc.js';
import { Button, Card, PageHeader, Badge, Illustrative, Empty, Tabs, cx, Help, CountUp } from '../components/ui.jsx';

const SRC = [['materials', 'Raw materials & precursors', '#1a5fdb'], ['gas', 'Natural gas', '#58a0ff'], ['fuel', 'Other fuels', '#8ec2ff'], ['process', 'Process emissions', '#16356b'], ['elec', 'Electricity (indirect)', '#10b981']];

function Donut({ parts }) {
  const total = parts.reduce((a, p) => a + p.v, 0) || 1;
  const r = 70, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 180 180" className="w-44 h-44 -rotate-90">
      <circle cx="90" cy="90" r={r} fill="none" stroke="#eaeff6" strokeWidth="26" />
      {parts.map((p) => {
        const len = (p.v / total) * c;
        const el = <circle key={p.id} cx="90" cy="90" r={r} fill="none" stroke={p.color} strokeWidth="26" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} style={{ transition: 'all .7s ease' }} />;
        acc += len;
        return el;
      })}
    </svg>
  );
}

export default function Results() {
  const { hierarchy, data, imported, go, ensureStage, route } = useStore();
  const { issues } = useDerived();
  const prods = flatProducts(hierarchy).filter((p) => hasAnyData(data, p.id));
  const [pid, setPid] = useState(prods[0]?.id || 'wirerod');
  const [sel, setSel] = useState('all');
  const [open, setOpen] = useState(false);

  if (!imported || !prods.length) return <Empty icon={Leaf} title="No results yet" text="Import data first. Embedded emissions are calculated as soon as a dataset exists." action={<><Button onClick={() => go('import')}>Go to import</Button><Button variant="secondary" onClick={() => ensureStage('fixed')}>Skip (demo)</Button></>} />;
  const product = prods.find((p) => p.id === pid) || prods[0];

  const rows = QUARTERS.map((q) => {
    const ds = data[`${product.id}:${q}`];
    const iss = issues.filter((i) => i.productId === product.id && i.q === q);
    const blocked = iss.some((i) => i.severity === 'error');
    const c = ds ? calc(ds) : null;
    return { q, ds, c, blocked, provisional: !blocked && iss.length > 0 };
  });
  const usable = rows.filter((r) => r.c && !r.blocked);
  const scope = sel === 'all' ? usable : usable.filter((r) => r.q === sel);
  const agg = scope.reduce((a, r) => ({ prod: a.prod + r.ds.production, direct: a.direct + r.c.direct, indirect: a.indirect + (r.c.indirect || 0), total: a.total + r.c.total, materials: a.materials + r.c.materials, gas: a.gas + r.c.gas, fuel: a.fuel + r.c.fuel, process: a.process + r.c.process }), { prod: 0, direct: 0, indirect: 0, total: 0, materials: 0, gas: 0, fuel: 0, process: 0 });
  const intensity = agg.prod ? agg.total / agg.prod : null;
  const parts = SRC.map(([id, label, color]) => ({ id, label, color, v: id === 'elec' ? agg.indirect : agg[id] }));
  const maxI = Math.max(0.6, ...usable.map((r) => r.c.intensity)) * 1.15;
  const selBlocked = sel !== 'all' && rows.find((r) => r.q === sel)?.blocked;

  return (
    <div>
      <PageHeader eyebrow="Data" title="Embedded emissions result" desc="Direct plus indirect emissions per tonne of product, by period. The calculation updates live as you fix data." actions={<><Illustrative /><Button iconRight={ArrowRight} onClick={() => go('sharing')}>Share results</Button></>} />
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <Tabs value={product.id} onChange={setPid} tabs={prods.map((p) => ({ id: p.id, label: `${p.name} · ${p.cn}` }))} />
        <Tabs value={sel} onChange={setSel} tabs={[{ id: 'all', label: `${YEAR} total` }, ...QUARTERS.map((q) => ({ id: q, label: q }))]} />
      </div>
      {issues.some((i) => i.productId === product.id) && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-sm text-amber-900 flex items-center gap-3 animate-rise"><Info className="w-4 h-4 shrink-0" />Provisional: {issues.filter((i) => i.productId === product.id).length} validation issue(s) affect this product. Affected periods are hatched or excluded.<button className="ml-auto font-medium underline" onClick={() => go('validation')}>Resolve</button></div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5" data-tour="results-kpis">
        {[['Embedded emissions', selBlocked ? null : intensity, 't CO₂e / t', 2, true, 'embedded'], ['Direct', agg.prod ? agg.direct / agg.prod : null, 't CO₂e / t', 2, false, 'direct'], ['Indirect', agg.prod ? agg.indirect / agg.prod : null, 't CO₂e / t', 2, false, 'indirect'], ['Total emissions', agg.total || null, 't CO₂e', 0, false]].map(([l, v, u, d, hero, help]) => (
          <Card key={l} className={cx('p-5 animate-rise', hero && 'bg-gradient-to-br from-sea-600 to-sea-800 text-white !border-0')}>
            <div className={cx('label flex items-center gap-1.5', hero && '!text-sea-200')}>{l} {help && <Help k={help} />}</div>
            <div className="text-3xl font-semibold num mt-1">{v != null ? <CountUp value={v} d={d} /> : '—'}</div>
            <div className={cx('text-xs mt-0.5', hero ? 'text-sea-200' : 'text-ink-500')}>{u}</div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-5">
        <Card className="p-6 animate-rise" data-tour="results-chart">
          <div className="flex items-center justify-between mb-5"><div className="font-semibold">Intensity by period</div><div className="flex gap-4 text-xs text-ink-500"><span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-sea-600" />Direct</span><span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />Indirect</span></div></div>
          <div className="relative h-64 flex items-end gap-5 pl-10 pr-2 border-b border-ink-200">
            {[0.25, 0.5, 0.75, 1].map((f) => <div key={f} className="absolute inset-x-0 border-t border-dashed border-ink-100" style={{ bottom: `${f * 100}%` }}><span className="absolute -top-2.5 left-0 text-[10px] text-ink-400 bg-white pr-1">{(maxI * f).toFixed(1)}</span></div>)}
            {rows.map((r) => {
              const active = sel === 'all' || sel === r.q;
              if (!r.c) return <div key={r.q} className="flex-1 flex items-end justify-center h-full"><div className="text-xs text-ink-400 pb-2">no data</div></div>;
              if (r.blocked) return (
                <div key={r.q} className="relative flex-1 h-full flex items-end z-10">
                  <div className="w-full h-[70%] rounded-t-lg border-2 border-dashed border-red-200 bg-red-50/50 flex flex-col items-center justify-center text-center p-2"><Lock className="w-4 h-4 text-red-400 mb-1" /><div className="text-[11px] text-red-600 font-medium">Pending validation</div></div>
                </div>
              );
              const hd = (r.c.directInt / maxI) * 100, hi = ((r.c.indirectInt || 0) / maxI) * 100;
              return (
                <button key={r.q} onClick={() => setSel(sel === r.q ? 'all' : r.q)} className={cx('group relative flex-1 h-full flex flex-col justify-end z-10 transition', !active && 'opacity-40')}>
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 text-xs font-semibold num" style={{ bottom: `calc(${hd + hi}% + 4px)`, top: 'auto', height: 16 }}>{r.c.intensity.toFixed(2)}</div>
                  <div className={cx('w-full bg-emerald-400 rounded-t-lg transition-all duration-700', r.provisional && 'hatch-amber')} style={{ height: `${hi}%` }} />
                  <div className={cx('w-full bg-sea-600 transition-all duration-700', r.provisional && 'hatch')} style={{ height: `${hd}%` }} />
                  <div className="pointer-events-none absolute bottom-full mb-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-ink-900 text-white text-xs rounded-lg px-3 py-2 w-40 transition z-20 text-left">
                    <div className="font-semibold">{r.q} {YEAR}{r.provisional ? ' · provisional' : ''}</div>
                    <div>Direct {r.c.directInt.toFixed(2)}</div><div>Indirect {(r.c.indirectInt || 0).toFixed(2)}</div><div>{fmt(r.ds.production)} t produced</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-5 pl-10 pr-2 mt-2">{rows.map((r) => <div key={r.q} className="flex-1 text-center text-sm text-ink-700 font-medium">{r.q}</div>)}</div>
        </Card>

        <Card className="p-6 animate-rise">
          <div className="font-semibold mb-4">Where the emissions come from</div>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0"><Donut parts={parts} /><div className="absolute inset-0 flex flex-col items-center justify-center"><div className="text-xl font-semibold num">{agg.total ? fmt(agg.total) : '—'}</div><div className="text-[11px] text-ink-500">tCO₂e</div></div></div>
            <div className="space-y-2.5 flex-1 min-w-0">
              {parts.map((p) => <div key={p.id} className="text-sm"><div className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: p.color }} /><span className="truncate flex-1 text-ink-700">{p.label}</span><b className="num">{agg.total ? Math.round((p.v / agg.total) * 100) : 0}%</b></div></div>)}
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-5 animate-rise overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-ink-500 bg-ink-50"><th className="px-5 py-2.5 font-medium">Period</th><th className="font-medium text-right">Production t</th><th className="font-medium text-right">Direct t/t</th><th className="font-medium text-right">Indirect t/t</th><th className="font-medium text-right">Embedded t/t</th><th className="font-medium text-right">Total tCO₂e</th><th className="font-medium pr-5 text-right">State</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.q} className="border-t border-ink-100">
              <td className="px-5 py-2.5 font-medium">{r.q} {YEAR}</td>
              <td className="text-right num">{r.ds ? fmt(r.ds.production) : '—'}</td>
              <td className="text-right num">{r.c && !r.blocked ? r.c.directInt.toFixed(2) : '—'}</td>
              <td className="text-right num">{r.c && !r.blocked ? (r.c.indirectInt ?? 0).toFixed(2) : '—'}</td>
              <td className="text-right num font-semibold">{r.c && !r.blocked ? r.c.intensity.toFixed(2) : '—'}</td>
              <td className="text-right num">{r.c && !r.blocked ? fmt(r.c.total) : '—'}</td>
              <td className="pr-5 text-right">{!r.c ? <Badge>No data</Badge> : r.blocked ? <Badge tone="red">Blocked</Badge> : r.provisional ? <Badge tone="amber">Provisional</Badge> : <Badge tone="green">Validated</Badge>}</td>
            </tr>))}</tbody>
        </table>
      </Card>

      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-medium text-sea-700"><FlaskConical className="w-4 h-4" /> How is this calculated? <ChevronDown className={cx('w-4 h-4 transition', open && 'rotate-180')} /></button>
      {open && <Card className="mt-3 p-5 text-sm text-ink-700 animate-rise leading-relaxed">
        <p><b>Embedded emissions</b> = (direct emissions + indirect emissions) ÷ tonnes produced.</p>
        <p className="mt-2"><b>Direct</b> = Σ(materials × factor) + gas Nm³ × 0.00202 + fuel t × 2.85 + process emissions. <b>Indirect</b> = electricity MWh × grid emission factor.</p>
        <p className="mt-2 text-ink-500">Factors are mock values chosen to be plausible. This prototype has no real CBAM calculation engine, and all values are illustrative.</p>
      </Card>}
    </div>
  );
}
