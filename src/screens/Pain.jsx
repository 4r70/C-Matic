import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Globe, Mail, Factory, ArrowRight, AlertTriangle, CheckCircle2, ShieldCheck, Clock, Repeat, Layers } from 'lucide-react';
import { useStore } from '../store/store.js';
import { IMPORTERS, PRODUCER } from '../data/seed.js';
import { savings } from '../lib/calc.js';
import { Button, Card, cx, Badge } from '../components/ui.jsx';

export const FORMAT_ICON = { Excel: FileSpreadsheet, PDF: FileText, Portal: Globe, 'E-mail': Mail, excel: FileSpreadsheet, pdf: FileText, api: Globe, email: Mail };
const FILES = { baltic: 'baltic_supplier_template_v3.xlsx', rhein: 'RheinBau_Declaration_signed.pdf', delta: 'portal.deltametals.example › Form 7B', lyon: 'RE: Données CBAM T3 (urgent)' };
const NOISE = { baltic: '63 cells re-keyed', rhein: '41 fields · signature', delta: 'typed by hand, again', lyon: 'table pasted in mail body' };
const Y = [12.5, 37.5, 62.5, 87.5];

export default function Pain() {
  const [mode, setMode] = useState('today');
  const { setRole } = useStore();
  const today = mode === 'today';
  const sv = savings(4);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6 animate-rise">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-sea-600 mb-1.5">One producer, one CBAM dataset, many EU importers</div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            Same data. Four importers. Four formats. <span className="text-sea-600">Every quarter.</span>
          </h1>
          <p className="text-ink-500 mt-2 text-[15px] max-w-2xl">Non-EU producers re-send identical production and emissions data to every EU importer they sell to. C-Matic is the trust layer in between: enter once, validate, calculate, share on your terms.</p>
        </div>
        <div data-tour="pain-toggle" className="flex p-1 rounded-xl bg-ink-100 text-sm font-medium">
          {[['today', 'Today'], ['cmatic', 'With C-Matic']].map(([id, l]) => (
            <button key={id} onClick={() => setMode(id)} className={cx('px-4 py-2 rounded-lg transition', mode === id ? 'bg-white shadow-soft text-sea-700' : 'text-ink-500')}>{l}</button>
          ))}
        </div>
      </div>

      <Card className="md:hidden p-4 space-y-2.5 animate-rise">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-sea-600 text-white flex items-center justify-center"><Factory className="w-5 h-5" /></div><div><div className="font-semibold text-sm">{PRODUCER.company}</div><div className="text-xs text-ink-500">{today ? 'Enters the same data 4×' : 'Enters data once, via C-Matic'}</div></div></div>
        {IMPORTERS.map((imp) => {
          const F = FORMAT_ICON[today ? imp.painFormat : imp.outFormat];
          return <div key={imp.id} className={cx('flex items-center gap-3 rounded-xl border p-3', today ? 'border-red-200' : 'border-sea-100 bg-sea-50/50')}><F className={cx('w-5 h-5 shrink-0', today ? 'text-red-500' : 'text-sea-600')} /><div className="min-w-0"><div className="text-sm font-medium truncate">{imp.name}</div><div className={cx('text-xs truncate', today ? 'text-red-600' : 'text-emerald-700')}>{today ? imp.painDetail : `Receives: ${imp.outLabel}`}</div></div></div>;
        })}
      </Card>

      <Card className="hidden md:block relative overflow-hidden h-[560px] bg-gradient-to-br from-white via-white to-sea-50/60 animate-rise">
        <div className="absolute inset-x-0 bottom-0 h-24 overflow-hidden opacity-60 pointer-events-none">
          <svg className="w-[200%] animate-wave" viewBox="0 0 1200 100" preserveAspectRatio="none" height="96">
            <path d="M0 50 Q150 10 300 50 T600 50 T900 50 T1200 50 V100 H0Z" fill="#d9eaff" />
          </svg>
        </div>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
          {today ? (
            <>
              {Y.map((y, i) => {
                const yy = (y / 100) * 500;
                const c = [[400, 60], [520, 440], [330, 380], [560, 120]][i];
                return <path key={i} d={`M 250 250 C ${c[0]} ${c[1]}, ${c[0] + 120} ${yy + (i % 2 ? -90 : 90)}, 745 ${yy}`} fill="none" stroke={['#f59e0b', '#ef4444', '#f97316', '#eab308'][i]} strokeWidth="2" vectorEffect="non-scaling-stroke" className="dash-flow" opacity=".8" />;
              })}
            </>
          ) : (
            <>
              <path d="M 250 250 L 440 250" stroke="#2f7cf6" strokeWidth="4" vectorEffect="non-scaling-stroke" className="dash-flow-slow" />
              {Y.map((y, i) => <path key={i} d={`M 560 250 C 650 250, 650 ${(y / 100) * 500}, 745 ${(y / 100) * 500}`} fill="none" stroke="#2f7cf6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" className="dash-flow-slow" />)}
            </>
          )}
        </svg>

        {/* producer */}
        <div className="absolute left-[3%] top-1/2 -translate-y-1/2 w-[23%] min-w-[170px]">
          <div className="card shadow-lift p-4">
            <div className="w-10 h-10 rounded-xl bg-sea-600 text-white flex items-center justify-center mb-3"><Factory className="w-5 h-5" /></div>
            <div className="font-semibold leading-tight">{PRODUCER.company}</div>
            <div className="text-xs text-ink-500 mt-0.5">{PRODUCER.city}, {PRODUCER.country}</div>
            <div className="mt-3 flex flex-wrap gap-1"><Badge tone="slate">Bolts 7318</Badge><Badge tone="slate">Wire rod 7213</Badge><Badge tone="slate">Rebar 7214</Badge></div>
            {today ? (
              <div className="mt-3 text-xs font-medium text-red-600 flex items-center gap-1.5"><Repeat className="w-3.5 h-3.5" /> Enters the same data 4×</div>
            ) : (
              <div className="mt-3 text-xs font-medium text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Enters data once</div>
            )}
          </div>
        </div>

        {/* hub */}
        {!today && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"><div className="animate-pop">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sea-500 to-sea-800 text-white flex flex-col items-center justify-center shadow-lift ring-8 ring-sea-100/70">
              <ShieldCheck className="w-8 h-8" />
              <div className="text-[11px] font-semibold mt-1">C-Matic</div>
            </div>
            <div className="mt-3 text-xs text-ink-500 w-44 -ml-10">validate · calculate · adapt · share</div>
          </div></div>
        )}

        {/* messy documents */}
        {today && IMPORTERS.map((imp, i) => {
          const F = FORMAT_ICON[imp.painFormat];
          const pos = [['40%', '16%', -5], ['49%', '64%', 4], ['37%', '44%', -3], ['52%', '30%', 6]][i];
          return (
            <div key={imp.id} className="absolute" style={{ left: pos[0], top: pos[1], rotate: `${pos[2]}deg` }}>
              <div className="animate-floaty flex items-center gap-1.5 bg-white border border-red-200 rounded-lg px-2 py-1.5 shadow-soft text-[11px] font-medium text-ink-700" style={{ animationDelay: `${i * 400}ms` }}>
                <F className="w-3.5 h-3.5 text-red-500" /> {imp.painFormat}
              </div>
            </div>
          );
        })}

        {/* importers */}
        {IMPORTERS.map((imp, i) => {
          const F = FORMAT_ICON[today ? imp.painFormat : imp.outFormat];
          return (
            <div key={imp.id} className="absolute right-[2.5%] w-[27%] min-w-[200px] -translate-y-1/2" style={{ top: `${Y[i]}%` }}>
              <div className={cx('card p-3 shadow-lift animate-rise', today && 'border-red-200')} style={{ animationDelay: `${i * 80}ms`, ...(today ? { rotate: `${[1.2, -1, 0.8, -1.4][i]}deg` } : {}) }}>
                <div className="flex items-center gap-2.5">
                  <div className={cx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', today ? 'bg-red-50 text-red-500' : 'bg-sea-50 text-sea-600')}><F className="w-[18px] h-[18px]" /></div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{imp.name}</div>
                    <div className="text-[11px] text-ink-500">{imp.city} · {imp.cc}</div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] flex items-center gap-1.5">
                  {today ? (<><AlertTriangle className="w-3 h-3 text-red-500 shrink-0" /><span className="text-red-600 truncate">{imp.painDetail}</span></>) : (<><CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /><span className="text-emerald-700">Receives: {imp.outLabel}</span></>)}
                </div>
                {today && <div className="text-[10px] text-ink-400 mt-1 truncate font-mono">{FILES[imp.id]} · {NOISE[imp.id]}</div>}
              </div>
            </div>
          );
        })}
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {(today
          ? [
              ['16', 'submissions per year', '4 importers × 4 periods', Repeat, 'text-red-600'],
              [`${sv.today} h`, 'manual work per year', 'copy, paste, re-format, e-mail', Clock, 'text-red-600'],
              ['4', 'different formats', 'Excel, PDF, portal, e-mail', Layers, 'text-amber-600'],
              ['0', 'data reused', 'every request starts from scratch', AlertTriangle, 'text-red-600'],
            ]
          : [
              ['1', 'dataset, entered once', 'validated before it leaves', CheckCircle2, 'text-emerald-600'],
              [`~${Math.round(sv.cmatic)} h`, 'per year, all importers', `${Math.round(sv.savedH)} h saved vs today`, Clock, 'text-emerald-600'],
              ['4', 'formats generated', 'adapted per importer automatically', Layers, 'text-sea-600'],
              ['0', 're-entries', 'each new importer reuses the data', Repeat, 'text-emerald-600'],
            ]
        ).map(([big, l, sub, Icon, c]) => (
          <Card key={l} className="p-4 animate-rise">
            <div className="flex items-center justify-between"><div className={cx('text-3xl font-semibold num', c)}>{big}</div><Icon className={cx('w-5 h-5', c)} /></div>
            <div className="text-sm font-medium mt-1">{l}</div>
            <div className="text-xs text-ink-500">{sub}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" iconRight={ArrowRight} data-tour="pain-cta" onClick={() => { setRole('importer'); }}>Start: importer sends an invite</Button>
        <Button size="lg" variant="secondary" onClick={() => useStore.getState().startTour()}>Start guided tour</Button>
        <span className="text-sm text-ink-500">Illustrative hours based on 7.5 h per importer per period.</span>
      </div>
    </div>
  );
}
