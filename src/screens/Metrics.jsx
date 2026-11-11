import React from 'react';
import { TrendingUp, Link2, Timer, ShieldCheck, Wallet, Target } from 'lucide-react';
import { useStore } from '../store/store.js';
import { Card, PageHeader, Badge, CountUp, Progress, Illustrative, cx } from '../components/ui.jsx';

function Spark({ pts, color = '#2f7cf6', h = 56, fill = true, target }) {
  const w = 220, max = Math.max(...pts), min = Math.min(...pts);
  const x = (i) => (i / (pts.length - 1)) * w;
  const y = (v) => h - 6 - ((v - min) / (max - min || 1)) * (h - 14);
  const d = pts.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      {fill && <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity=".1" />}
      {target != null && <line x1="0" x2={w} y1={y(target)} y2={y(target)} stroke="#10b981" strokeDasharray="4 4" strokeWidth="1.2" />}
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1])} r="3.5" fill={color} />
    </svg>
  );
}

const MRR = [9.2, 11.1, 13.4, 16.0, 18.3, 21.9, 25.4, 28.8, 32.5, 36.1, 38.9, 41.8];
const MONTHS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

export default function Metrics() {
  const { connections, timers } = useStore();
  const demoConns = Object.keys(connections).length;
  const demoSecs = timers.importAt && timers.readyAt && timers.readyAt - timers.importAt >= 5000 ? Math.round((timers.readyAt - timers.importAt) / 1000) : null;
  const funnel = [['Invited', 412, 100], ['Accepted', 301, 73], ['Onboarded', 214, 52], ['Data shared (30 d)', 148, 36]];
  return (
    <div>
      <PageHeader eyebrow="Insights" title="Platform metrics" desc="The numbers that show whether the network is working. Seeded demo values, plus live additions from the run you just did." actions={<Illustrative />} />
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-5" data-tour="metrics-kpis">
        <Card className="p-5 animate-rise"><div className="flex items-center justify-between"><div className="label">Verified connections</div><Link2 className="w-4 h-4 text-sea-600" /></div><div className="text-3xl font-semibold num mt-1"><CountUp value={187 + demoConns} /></div><div className="text-xs text-emerald-600 mt-1">+23 this month{demoConns ? ` · +${demoConns} from your demo` : ''}</div></Card>
        <Card className="p-5 animate-rise"><div className="flex items-center justify-between"><div className="label">Activation (30 days)</div><Target className="w-4 h-4 text-sea-600" /></div><div className="flex items-end gap-2 mt-1"><div className="text-3xl font-semibold num">36%</div><Badge tone="green">target 33%</Badge></div><Progress className="mt-2" tone="green" value={(36 / 50) * 100} /></Card>
        <Card className="p-5 animate-rise"><div className="flex items-center justify-between"><div className="label">Entry → ready dataset</div><Timer className="w-4 h-4 text-sea-600" /></div><div className="text-3xl font-semibold num mt-1">{demoSecs != null ? <CountUp value={demoSecs < 90 ? demoSecs : demoSecs / 60} d={demoSecs < 90 ? 0 : 1} suffix={demoSecs < 90 ? ' s' : ' min'} /> : '38 min'}</div><div className="text-xs text-ink-500 mt-1">{demoSecs != null ? 'your demo run · median is 38 min' : 'median · was 4.2 days with Excel'}</div></Card>
        <Card className="p-5 animate-rise"><div className="flex items-center justify-between"><div className="label">Validation error rate</div><ShieldCheck className="w-4 h-4 text-sea-600" /></div><div className="text-3xl font-semibold num mt-1">11.8%</div><div className="text-xs text-emerald-600 mt-1">first import · 0% after fixes</div></Card>
        <Card className="p-5 animate-rise"><div className="flex items-center justify-between"><div className="label">MRR</div><Wallet className="w-4 h-4 text-sea-600" /></div><div className="text-3xl font-semibold num mt-1">€41.8k</div><div className="text-xs text-emerald-600 mt-1">+7.5% month on month</div></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6 animate-rise">
          <div className="flex items-center justify-between mb-4"><div className="font-semibold">Supplier activation funnel</div><span className="text-xs text-ink-500">last 30 days</span></div>
          <div className="space-y-3">{funnel.map(([l, n, p], i) => (
            <div key={l}><div className="flex justify-between text-sm mb-1"><span className="font-medium">{l}</span><span className="num text-ink-500">{n} <span className="text-ink-300">·</span> {p}%</span></div>
              <div className="h-7 rounded-lg bg-ink-100 overflow-hidden"><div className="h-full rounded-lg bg-gradient-to-r from-sea-400 to-sea-600 transition-all duration-1000" style={{ width: `${p}%`, opacity: 1 - i * 0.12 }} /></div></div>
          ))}</div>
          <div className="mt-4 text-xs text-ink-500 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-emerald-600" /> Activation target: 33% of invited suppliers share data within 30 days. Currently 36%.</div>
        </Card>
        <Card className="p-6 animate-rise">
          <div className="flex items-center justify-between mb-2"><div className="font-semibold">MRR, last 12 months (€k)</div><Badge tone="green" icon={TrendingUp}>4.5× YoY</Badge></div>
          <div className="flex items-end gap-1.5 h-40">{MRR.map((v, i) => <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group"><div className="text-[10px] text-ink-500 opacity-0 group-hover:opacity-100 num">{v}</div><div className={cx('w-full rounded-t-md transition-all duration-700', i === MRR.length - 1 ? 'bg-sea-600' : 'bg-sea-200')} style={{ height: `${(v / 45) * 100}%` }} /></div>)}</div>
          <div className="flex gap-1.5 mt-1.5">{MONTHS.map((m) => <div key={m} className="flex-1 text-center text-[10px] text-ink-400">{m}</div>)}</div>
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm"><div className="rounded-xl bg-ink-50 p-3"><div className="text-xs text-ink-500">Producer subscriptions</div><div className="font-semibold num">€19.4k</div></div><div className="rounded-xl bg-ink-50 p-3"><div className="text-xs text-ink-500">Importer plans + seats</div><div className="font-semibold num">€22.4k</div></div></div>
        </Card>
        <Card className="p-6 animate-rise">
          <div className="font-semibold mb-1">Time from data entry to ready dataset</div><div className="text-xs text-ink-500 mb-2">median minutes, weekly</div>
          <Spark pts={[190, 152, 118, 96, 84, 71, 62, 55, 49, 44, 41, 38]} />
        </Card>
        <Card className="p-6 animate-rise">
          <div className="font-semibold mb-1">Validation error rate at first import</div><div className="text-xs text-ink-500 mb-2">% of datasets with at least one issue; target below 10%</div>
          <Spark pts={[27, 24, 22.5, 21, 18.5, 17, 15.2, 14.4, 13.5, 12.6, 12.1, 11.8]} color="#10b981" target={10} />
        </Card>
      </div>
    </div>
  );
}
