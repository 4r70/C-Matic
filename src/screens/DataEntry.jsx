import React, { useEffect, useState } from 'react';
import { Package, Zap, Flame, Factory, Gauge, Leaf, ArrowLeft, ArrowRight, Save, Sparkles, Layers } from 'lucide-react';
import { useStore } from '../store/store.js';
import { QUARTERS, YEAR } from '../data/seed.js';
import { flatProducts, calc, rangeFor, fmt, delay, AVG_GRID_EF } from '../lib/calc.js';
import { Button, Card, PageHeader, Field, cx, Badge, Illustrative, Empty } from '../components/ui.jsx';

const BLANK = { production: '', scrapT: '', pigIronT: '', ferroalloysT: '', precursorT: '', elec: { value: '', unit: 'MWh' }, gridEF: '', gasNm3: '', fuelT: '', processT: '' };
const EXAMPLE = { production: 12400, scrapT: 12900, pigIronT: 600, ferroalloysT: 120, precursorT: 0, elec: { value: 5700, unit: 'MWh' }, gridEF: 0.43, gasNm3: 1450000, fuelT: 310, processT: 620 };
const STEPS = [
  { id: 'prod', label: 'Production', icon: Package, text: 'How many tonnes did you produce in this period?' },
  { id: 'mat', label: 'Raw materials', icon: Layers, text: 'Metallic inputs and purchased precursors for this period.' },
  { id: 'energy', label: 'Electricity', icon: Zap, text: 'Electricity consumed to make this product.' },
  { id: 'fuel', label: 'Fuels', icon: Flame, text: 'Fuels burned on site. Gas is in normal cubic metres (Nm³).' },
  { id: 'direct', label: 'Process emissions', icon: Factory, text: 'Emissions from chemistry rather than fuels, e.g. electrodes and fluxes.' },
  { id: 'indirect', label: 'Grid factor', icon: Gauge, text: 'How carbon-intensive your electricity grid is.' },
];

const toNum = (v) => (v === '' || v == null ? null : Number(v));
const normalise = (d) => ({ production: toNum(d.production) || 0, scrapT: toNum(d.scrapT) || 0, pigIronT: toNum(d.pigIronT) || 0, ferroalloysT: toNum(d.ferroalloysT) || 0, precursorT: toNum(d.precursorT) || 0, elec: { value: toNum(d.elec.value), unit: d.elec.unit }, gridEF: toNum(d.gridEF), gasNm3: toNum(d.gasNm3) || 0, fuelT: toNum(d.fuelT) || 0, processT: toNum(d.processT) || 0 });
const toForm = (ds) => (ds ? { ...ds, elec: { ...ds.elec }, gridEF: ds.gridEF ?? '' } : JSON.parse(JSON.stringify(BLANK)));

function NumInput({ label, unit, help, value, onChange, hint, step = 'any' }) {
  return (
    <Field label={label} help={help} hint={hint}>
      <div className="relative">
        <input type="number" step={step} className="input pr-16 num" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
        {unit && <span className="absolute right-3 top-2 text-xs text-ink-400">{unit}</span>}
      </div>
    </Field>
  );
}

export default function DataEntry() {
  const { route, hierarchy, data, saveDataset, toast, go, onboarded, ensureStage, periods } = useStore();
  const prods = flatProducts(hierarchy);
  const pid = route.params?.pid || prods[0]?.id;
  const q = route.params?.q || 'Q1';
  const key = `${pid}:${q}`;
  const [form, setForm] = useState(() => toForm(data[key]));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  useEffect(() => { setForm(toForm(data[key])); setStep(0); }, [key]);

  if (!onboarded) return <Empty icon={Layers} title="Set up your company first" text="Pick a product and period once your factories are defined." action={<><Button onClick={() => go('onboarding')}>Go to onboarding</Button><Button variant="secondary" onClick={() => ensureStage('onboarded')}>Skip (demo)</Button></>} />;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const ds = normalise(form);
  const c = calc(ds);
  const [lo, hi] = rangeFor(pid);
  const has = ds.production > 0 && ds.elec.value;
  const out = has && c.intensity != null && (c.intensity > hi || c.intensity < lo * 0.5);
  const save = async () => { setSaving(true); await delay(700, 1000); saveDataset(pid, q, ds); setSaving(false); toast(`${prods.find((p) => p.id === pid)?.name} ${q} saved as v${periods[q].version + 1}`); };
  const S = STEPS[step];

  return (
    <div>
      <PageHeader eyebrow="Data" title="Guided data entry" desc="Prefer typing to uploading? Step through each block. Hover the ? icons for plain-language explanations of CBAM terms."
        actions={<Button variant="secondary" icon={Sparkles} onClick={() => { setForm(toForm(EXAMPLE)); toast('Example values filled in', 'info'); }}>Fill with example values</Button>} />
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="input !w-auto" value={pid} onChange={(e) => go('entry', { pid: e.target.value, q })}>{prods.map((p) => <option key={p.id} value={p.id}>{p.name} · CN {p.cn}</option>)}</select>
        <select className="input !w-auto" value={q} onChange={(e) => go('entry', { pid, q: e.target.value })}>{QUARTERS.map((x) => <option key={x} value={x}>{x} {YEAR}</option>)}</select>
        {data[key] ? <Badge tone="blue">Loaded from import · v{periods[q].version}</Badge> : <Badge tone="slate">New dataset</Badge>}
      </div>

      <div className="grid lg:grid-cols-[200px_1fr_300px] gap-5">
        <div className="space-y-1">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)} className={cx('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition', i === step ? 'bg-sea-600 text-white shadow-sm' : 'text-ink-700 hover:bg-ink-100')}><s.icon className="w-4 h-4" />{s.label}</button>
          ))}
        </div>

        <Card className="p-6 animate-rise" key={step + key}>
          <div className="flex items-center gap-3 mb-1"><S.icon className="w-5 h-5 text-sea-600" /><h3 className="text-lg font-semibold">{S.label}</h3></div>
          <p className="text-sm text-ink-500 mb-5">{S.text}</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {step === 0 && <NumInput label="Production quantity" unit="tonnes" value={form.production} onChange={(v) => set({ production: v })} hint="Finished, saleable product in this period." />}
            {step === 1 && <>
              <NumInput label="Scrap input" unit="t" value={form.scrapT} onChange={(v) => set({ scrapT: v })} />
              <NumInput label="Pig iron input" unit="t" value={form.pigIronT} onChange={(v) => set({ pigIronT: v })} />
              <NumInput label="Ferroalloys" unit="t" value={form.ferroalloysT} onChange={(v) => set({ ferroalloysT: v })} />
              <NumInput label="Purchased precursor" help="precursor" unit="t" value={form.precursorT} onChange={(v) => set({ precursorT: v })} hint="e.g. wire rod bought in to make bolts." />
            </>}
            {step === 2 && <>
              <NumInput label="Electricity consumed" value={form.elec.value} onChange={(v) => set({ elec: { ...form.elec, value: v } })} />
              <Field label="Unit" hint="kWh vs MWh is the most common data error. We check it for you.">
                <div className="flex gap-2">{['kWh', 'MWh'].map((u) => <button key={u} onClick={() => set({ elec: { ...form.elec, unit: u } })} className={cx('flex-1 py-2 rounded-lg border text-sm font-medium transition', form.elec.unit === u ? 'bg-sea-600 text-white border-sea-600' : 'border-ink-200 hover:border-sea-300')}>{u}</button>)}</div>
              </Field>
            </>}
            {step === 3 && <>
              <NumInput label="Natural gas" unit="Nm³" value={form.gasNm3} onChange={(v) => set({ gasNm3: v })} />
              <NumInput label="Coal / coke / other fuel" unit="t" value={form.fuelT} onChange={(v) => set({ fuelT: v })} />
            </>}
            {step === 4 && <NumInput label="Direct process emissions" help="direct" unit="tCO₂" value={form.processT} onChange={(v) => set({ processT: v })} hint="Electrodes, fluxes, carbon additions." />}
            {step === 5 && <>
              <NumInput label="Grid emission factor" help="gridEF" unit="tCO₂/MWh" value={form.gridEF} onChange={(v) => set({ gridEF: v })} />
              <Field label="Don’t know it?"><Button variant="secondary" size="sm" onClick={() => set({ gridEF: AVG_GRID_EF })}>Use published national average ({AVG_GRID_EF})</Button></Field>
            </>}
          </div>
          <div className="flex justify-between mt-8">
            <Button variant="ghost" icon={ArrowLeft} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < STEPS.length - 1 ? <Button iconRight={ArrowRight} onClick={() => setStep(step + 1)}>Next</Button> : <Button icon={Save} loading={saving} disabled={!has} onClick={save}>Save dataset</Button>}
          </div>
        </Card>

        <Card className="p-5 h-fit lg:sticky lg:top-4 animate-rise">
          <div className="flex items-center justify-between mb-3"><div className="label">Live result</div><Illustrative /></div>
          <div className="text-4xl font-semibold num">{has && c.intensity != null ? c.intensity.toFixed(2) : '—'}<span className="text-sm font-normal text-ink-500 ml-1.5">tCO₂e / t</span></div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-500 flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" />Direct</span><b className="num">{has ? fmt(c.direct) : '—'} t</b></div>
            <div className="flex justify-between"><span className="text-ink-500 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />Indirect</span><b className="num">{has ? (c.indirect == null ? 'no grid factor' : `${fmt(c.indirect)} t`) : '—'}</b></div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-ink-100 overflow-hidden flex">
            {has && c.total > 0 && <><div className="bg-sea-600 transition-all duration-500" style={{ width: `${(c.direct / c.total) * 100}%` }} /><div className="bg-sea-300 transition-all duration-500" style={{ width: `${((c.indirect || 0) / c.total) * 100}%` }} /></>}
          </div>
          <div className="flex justify-between text-[11px] text-ink-500 mt-1.5"><span>■ direct</span><span>■ indirect</span></div>
          {out && <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">Outside the typical {lo}–{hi} range. Double-check your figures, or save and let validation guide you.</div>}
          {!has && <div className="mt-4 text-xs text-ink-400">Enter production and electricity to see the result.</div>}
        </Card>
      </div>
    </div>
  );
}
