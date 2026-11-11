import React, { useState } from 'react';
import { Clock, Wallet, Users, FileWarning, Zap } from 'lucide-react';
import { savings, fmt } from '../lib/calc.js';
import { Card, PageHeader, Illustrative, CountUp, cx } from '../components/ui.jsx';

function Slider({ label, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{label}</span><span className="num text-sea-700 font-semibold">{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-sea-600" />
    </div>
  );
}

export default function SavingsCalc() {
  const [n, setN] = useState(4);
  const [periods, setPeriods] = useState(4);
  const [h, setH] = useState(7.5);
  const [rate, setRate] = useState(55);
  const s = savings(n, periods, h, rate);
  const max = Math.max(s.today, s.cmatic, 1);
  const costToday = s.today * rate, costC = s.cmatic * rate;
  return (
    <div>
      <PageHeader eyebrow="Insights" title="Time and cost saved" desc="Excel and e-mail today vs one C-Matic dataset. Move the sliders: the more importers you serve, the bigger the gap." actions={<Illustrative />} />
      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <Card className="p-6 space-y-6 animate-rise h-fit">
          <div className="flex items-center gap-2 font-semibold"><Users className="w-4 h-4 text-sea-600" /> Your situation</div>
          <Slider label="EU importers you serve" value={n} onChange={setN} min={1} max={20} />
          <Slider label="Reporting periods per year" value={periods} onChange={setPeriods} min={1} max={12} />
          <Slider label="Hours per importer per period" value={h} onChange={setH} min={1} max={16} step={0.5} unit=" h" />
          <Slider label="Loaded hourly cost" value={rate} onChange={setRate} min={20} max={120} step={5} unit=" €" />
          <div className="text-xs text-ink-500 leading-relaxed">C-Matic model: 6 h one-off setup, 2.5 h per period to review and validate once, and 0.1 h per importer per period to approve sharing. Illustrative assumptions.</div>
        </Card>

        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-gradient-to-br from-sea-600 to-sea-800 text-white !border-0 animate-rise"><div className="label !text-sea-200 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Hours saved / year</div><div className="text-4xl font-semibold num mt-1"><CountUp value={s.savedH} /></div></Card>
            <Card className="p-5 animate-rise"><div className="label flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Cost saved / year</div><div className="text-4xl font-semibold num mt-1 text-emerald-600"><CountUp value={s.savedEur} prefix="€" /></div></Card>
            <Card className="p-5 animate-rise"><div className="label flex items-center gap-1.5"><FileWarning className="w-3.5 h-3.5" /> Submissions avoided</div><div className="text-4xl font-semibold num mt-1"><CountUp value={s.submissions - periods} /></div><div className="text-xs text-ink-500">{s.submissions} manual → {periods} reviews</div></Card>
          </div>
          <Card className="p-6 animate-rise">
            <div className="font-semibold mb-5">Annual effort</div>
            {[['Today: Excel + PDF + portals + e-mail', s.today, costToday, 'bg-red-400'], ['With C-Matic: enter once, share to all', s.cmatic, costC, 'bg-sea-600']].map(([l, v, c, col]) => (
              <div key={l} className="mb-5 last:mb-0"><div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{l}</span><span className="num text-ink-500"><b className="text-ink-900">{fmt(v, 0)} h</b> · €{fmt(c)}</span></div>
                <div className="h-9 rounded-xl bg-ink-100 overflow-hidden"><div className={cx('h-full rounded-xl transition-all duration-700', col)} style={{ width: `${(v / max) * 100}%` }} /></div></div>
            ))}
          </Card>
          <Card className="p-5 animate-rise flex items-center gap-4 bg-sea-50 border-sea-100"><Zap className="w-6 h-6 text-sea-600 shrink-0" /><div className="text-sm text-ink-700">Each additional importer adds only <b>{(periods * 0.1).toFixed(1)} h</b> per year with C-Matic, versus <b>{fmt(periods * h, 1)} h</b> manually. That is the network effect in one number.</div></Card>
        </div>
      </div>
    </div>
  );
}
