import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, ArrowRight, Wand2, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useStore } from '../store/store.js';
import { SAMPLE_FILE, MAP_FIELDS } from '../data/seed.js';
import { delay } from '../lib/calc.js';
import { useDerived } from '../store/derived.js';
import { Button, Card, PageHeader, Badge, Skeleton, StepRunner, cx, Empty } from '../components/ui.jsx';

export default function Import() {
  const { imported, importSample, go, onboarded, ensureStage, toast } = useStore();
  const { issues } = useDerived();
  const [stage, setStage] = useState(imported ? 'done' : 'upload');
  const [drag, setDrag] = useState(false);
  const [map, setMap] = useState(() => Object.fromEntries(SAMPLE_FILE.columns.map((c) => [c.src, c.review ? '' : c.field])));

  if (!onboarded) return <Empty icon={Layers} title="Set up your company first" text="Import needs your factories and products to attach the data to." action={<><Button onClick={() => go('onboarding')}>Go to onboarding</Button><Button variant="secondary" onClick={() => ensureStage('onboarded')}>Skip (demo)</Button></>} />;

  const choose = async () => { setStage('reading'); await delay(800, 1100); setStage('map'); };
  const unresolved = SAMPLE_FILE.columns.filter((c) => !map[c.src]);
  const requiredMissing = MAP_FIELDS.filter((f) => f.req && !Object.values(map).includes(f.id));
  const ok = !unresolved.length && !requiredMissing.length;

  return (
    <div>
      <PageHeader eyebrow="Data" title="Import your spreadsheet" desc="Drop in the Excel you already have. We map your columns to the CBAM data model, so you never retype a number." />
      {stage === 'upload' && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-5 animate-rise">
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); choose(); }}
            className={cx('rounded-2xl border-2 border-dashed p-14 text-center transition bg-white', drag ? 'border-sea-500 bg-sea-50' : 'border-ink-300')}>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sea-50 text-sea-600 flex items-center justify-center"><UploadCloud className="w-8 h-8" /></div>
            <div className="text-lg font-semibold mt-4">Drag a .xlsx or .csv file here</div>
            <div className="text-sm text-ink-500 mt-1">or use the bundled sample from Anadolu Çelik’s production system</div>
            <div className="mt-5 flex justify-center gap-2"><Button data-tour="import-start" icon={FileSpreadsheet} onClick={choose}>Use sample file</Button><Button variant="secondary" soon>Browse files</Button></div>
          </div>
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wider font-semibold text-ink-500">Bundled sample</div>
            <div className="flex items-center gap-3 mt-3"><div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center"><FileSpreadsheet className="w-5 h-5" /></div><div><div className="text-sm font-medium break-all">{SAMPLE_FILE.name}</div><div className="text-xs text-ink-500">{SAMPLE_FILE.sizeKb} KB · sheet “{SAMPLE_FILE.sheet}”</div></div></div>
            <ul className="text-sm text-ink-700 mt-4 space-y-1.5 list-disc pl-4"><li>12 rows: 3 products × 4 quarters</li><li>Turkish column headers</li><li>Quantities, energy, fuels, process emissions</li></ul>
          </Card>
        </div>
      )}

      {stage === 'reading' && (
        <Card className="p-6 animate-pop"><div className="flex items-center gap-3 mb-4"><FileSpreadsheet className="w-5 h-5 text-emerald-600" /><span className="font-medium">Reading {SAMPLE_FILE.name}…</span></div><div className="space-y-2.5">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div></Card>
      )}

      {stage === 'map' && (
        <div className="animate-rise space-y-4">
          <Card className="p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm"><Wand2 className="w-4 h-4 text-sea-600" /><b>{SAMPLE_FILE.columns.length - SAMPLE_FILE.columns.filter((c) => c.review).length}</b> of {SAMPLE_FILE.columns.length} columns matched automatically</div>
            {unresolved.length > 0 && <Badge tone="amber" icon={AlertTriangle}>{unresolved.length} need your review</Badge>}
            <div className="flex-1" />
            {unresolved.length > 0 && <Button variant="soft" icon={Wand2} onClick={() => setMap(Object.fromEntries(SAMPLE_FILE.columns.map((c) => [c.src, c.field])))}>Accept all suggestions</Button>}
          </Card>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-ink-500 bg-ink-50"><th className="px-5 py-2.5 font-medium">Your column</th><th className="font-medium">Sample</th><th className="font-medium w-8" /><th className="font-medium w-72">C-Matic field</th><th className="font-medium pr-5 text-right">Confidence</th></tr></thead>
              <tbody>
                {SAMPLE_FILE.columns.map((c) => {
                  const need = !map[c.src];
                  return (
                    <tr key={c.src} className={cx('border-t border-ink-100', need && 'bg-amber-50/60')}>
                      <td className="px-5 py-2.5 font-mono text-[13px]">{c.src}</td>
                      <td className="text-ink-500 num">{c.sample}</td>
                      <td><ArrowRight className="w-4 h-4 text-ink-300" /></td>
                      <td className="py-2"><select className={cx('input !py-1.5', need && '!border-amber-400')} value={map[c.src]} onChange={(e) => setMap({ ...map, [c.src]: e.target.value })}>
                        <option value="">Select a field…</option>{MAP_FIELDS.map((f) => <option key={f.id} value={f.id}>{f.label}{f.req ? ' *' : ''}</option>)}
                      </select></td>
                      <td className="pr-5 text-right">{need ? <button className="text-xs font-medium text-sea-700 hover:underline" onClick={() => setMap({ ...map, [c.src]: c.field })}>Accept suggestion</button> : <Badge tone={c.conf >= 90 ? 'green' : 'blue'}>{c.conf}%</Badge>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => setStage('upload')}>Back</Button>
            <div className="flex items-center gap-3">{!ok && <span className="text-sm text-ink-500">Resolve the highlighted columns to continue.</span>}<Button disabled={!ok} iconRight={ArrowRight} data-tour="map-continue" onClick={() => setStage('run')}>Import 12 rows</Button></div>
          </div>
        </div>
      )}

      {stage === 'run' && (
        <div className="pt-4"><StepRunner title="Importing your data" subtitle={SAMPLE_FILE.name}
          steps={['Parsing 12 rows', 'Normalising number formats (1.450.000 → 1,450,000)', 'Attaching rows to factories and products', 'Creating reporting periods Q1–Q4', 'Running validation checks']}
          onDone={() => { importSample(); setStage('done'); toast('Imported 12 rows. Validation found issues to review.', 'info'); }} /></div>
      )}

      {stage === 'done' && (
        <Card className="max-w-2xl mx-auto p-10 text-center animate-pop">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-9 h-9" /></div>
          <h2 className="text-2xl font-semibold mt-4">Data imported once. Done.</h2>
          <p className="text-ink-500 mt-2">12 rows across 3 products and 4 quarters. Validation found <b className={issues.length ? 'text-red-600' : 'text-emerald-600'}>{issues.length} {issues.length === 1 ? 'issue' : 'issues'}</b>{issues.length ? ' to resolve before you can share.' : '. You are ready to share.'}</p>
          <div className="mt-6 flex justify-center gap-2"><Button variant="secondary" onClick={() => { setStage('upload'); }}>Import again</Button><Button iconRight={ArrowRight} data-tour="to-validation" onClick={() => go('validation')}>{issues.length ? 'Review issues' : 'Open validation'}</Button></div>
        </Card>
      )}
    </div>
  );
}
