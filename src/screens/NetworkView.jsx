import React, { useState } from 'react';
import { Network, Repeat, Clock, Link2, PlusCircle, Zap } from 'lucide-react';
import { useStore } from '../store/store.js';
import { IMPORTERS, NEW_IMPORTER, PRODUCER } from '../data/seed.js';
import { Button, Card, PageHeader, Badge, StepRunner, Modal, cx, CountUp } from '../components/ui.jsx';

const OTHERS = [
  ['Marmara Demir', [0, 1]], ['Pune Forgings', [0, 3]], ['Gulf Wire FZE', [1, 2]], ['Dnipro Metiz', [0, 2, 3]],
  ['Morava Steel', [1]], ['Hai Phong Bolt', [2, 3]], ['Java Steelworks', [1, 2]],
];

export default function NetworkView() {
  const { connections, reuse, extraImporter, addExtraImporter, shareWith, toast, imported, ensureStage, go } = useStore();
  const [sim, setSim] = useState(false);
  const imps = extraImporter ? [...IMPORTERS, NEW_IMPORTER] : IMPORTERS;
  const impY = (i) => 70 + i * (320 / Math.max(1, imps.length - 1));
  const prodNodes = [{ id: 'anadolu', name: PRODUCER.short }, ...OTHERS.map(([n]) => ({ id: n, name: n }))];
  const prodY = (j) => 62 + j * (350 / (prodNodes.length - 1));
  const hours = reuse.reduce((a, r) => a + r.hours, 0);
  const conns = Object.keys(connections);
  const last = reuse[reuse.length - 1];

  const simulate = () => {
    if (!conns.length) { toast('Share data with a first importer to see the network effect', 'info'); return; }
    setSim(true);
  };
  const done = () => { addExtraImporter(); const r = shareWith(['nordic']); setSim(false); toast(r.length ? 'Nordic Rebar AB connected: data reused, 0 re-entry' : 'Could not connect: validate your periods first', r.length ? 'ok' : 'err'); };

  return (
    <div>
      <PageHeader eyebrow="Insights" title="Network effect" desc="Every importer that connects to an already-onboarded producer is a zero-effort connection. Every producer that onboards makes C-Matic more useful to all of its importers."
        actions={<>{!imported && <Button variant="secondary" onClick={() => { ensureStage('shared'); }}>Skip: share with 4 importers</Button>}<Button icon={PlusCircle} disabled={extraImporter} data-tour="simulate-importer" onClick={simulate}>{extraImporter ? 'Nordic Rebar connected' : 'Simulate new importer'}</Button></>} />
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        <Card className="p-4 animate-rise" data-tour="network-graph">
          <svg viewBox="0 0 760 440" className="w-full">
            <text x="120" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#8593aa" letterSpacing="1">EU IMPORTERS</text>
            <text x="640" y="22" textAnchor="middle" fontSize="11" fontWeight="600" fill="#8593aa" letterSpacing="1">NON-EU PRODUCERS</text>
            {OTHERS.map(([n, list], k) => list.map((ii) => ii < imps.length && <path key={n + ii} d={`M 230 ${impY(ii)} C 400 ${impY(ii)}, 450 ${prodY(k + 1)}, 540 ${prodY(k + 1)}`} fill="none" stroke="#dbe2ec" strokeWidth="1.5" />))}
            {imps.map((imp, i) => {
              const c = connections[imp.id];
              return <path key={imp.id} d={`M 230 ${impY(i)} C 400 ${impY(i)}, 450 ${prodY(0)}, 540 ${prodY(0)}`} fill="none" stroke={c ? '#2f7cf6' : '#bcdaff'} strokeWidth={c ? 3.5 : 1.5} strokeDasharray={c ? undefined : '4 5'} className={c ? 'animate-drawIn' : ''} style={c ? { '--len': 600, strokeDasharray: 600 } : undefined} />;
            })}
            {imps.map((imp, i) => (
              <g key={imp.id} className={imp.id === 'nordic' ? 'animate-pop' : ''}>
                <rect x="10" y={impY(i) - 20} width="220" height="40" rx="12" fill="#fff" stroke={connections[imp.id] ? '#2f7cf6' : '#dbe2ec'} strokeWidth="1.5" />
                <circle cx="32" cy={impY(i)} r="10" fill={connections[imp.id] ? '#2f7cf6' : '#eaeff6'} /><text x="32" y={impY(i) + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill={connections[imp.id] ? '#fff' : '#5b6b85'}>{imp.cc}</text>
                <text x="50" y={impY(i) - 2} fontSize="12" fontWeight="600" fill="#0b1b33">{imp.short}</text><text x="50" y={impY(i) + 12} fontSize="10" fill="#5b6b85">{imp.city}</text>
              </g>
            ))}
            {prodNodes.map((p, j) => (
              <g key={p.id}>
                <rect x="540" y={prodY(j) - (j === 0 ? 18 : 14)} width={j === 0 ? 200 : 170} height={j === 0 ? 36 : 28} rx="10" fill={j === 0 ? '#16356b' : '#fff'} stroke={j === 0 ? '#16356b' : '#dbe2ec'} strokeWidth="1.5" />
                <text x={j === 0 ? 640 : 625} y={prodY(j) + 4} textAnchor="middle" fontSize={j === 0 ? 12 : 11} fontWeight={j === 0 ? 700 : 500} fill={j === 0 ? '#fff' : '#2b3d5b'}>{p.name}</text>
              </g>
            ))}
          </svg>
          <div className="flex flex-wrap gap-4 px-3 pb-2 text-xs text-ink-500"><span className="flex items-center gap-1.5"><i className="w-5 h-0.5 bg-sea-500 rounded" /> Anadolu Çelik connection</span><span className="flex items-center gap-1.5"><i className="w-5 h-0.5 bg-ink-200 rounded" /> other producers (seeded)</span><span className="flex items-center gap-1.5"><i className="w-5 border-t border-dashed border-sea-300" /> not yet connected</span></div>
        </Card>

        <div className="space-y-4">
          {[['Connections (Anadolu)', conns.length, '', Link2, 0], ['Data re-entries', 0, '', Repeat, 0], ['Hours saved', hours, ' h', Clock, 0]].map(([l, v, u, I, d]) => (
            <Card key={l} className="p-4 animate-rise"><div className="flex items-center justify-between"><div className="label">{l}</div><I className="w-4 h-4 text-sea-600" /></div><div className="text-3xl font-semibold num mt-1"><CountUp value={v} d={d} suffix={u} /></div></Card>
          ))}
          <Card className="p-4 animate-rise">
            <div className="label mb-2">Reuse log</div>
            {reuse.length ? <ul className="space-y-2.5">{reuse.map((r, i) => { const imp = [...IMPORTERS, NEW_IMPORTER].find((x) => x.id === r.importerId); return <li key={i} className="text-sm animate-rise"><div className="flex items-center gap-1.5 font-medium"><Zap className="w-3.5 h-3.5 text-emerald-600" />{imp.short} connected</div><div className="text-xs text-emerald-700 ml-5">data reused · 0 re-entry · {r.hours} h saved</div></li>; })}</ul> : <div className="text-sm text-ink-400">The first importer needs data entry. Every one after that is free. Share with importers to see the log.</div>}
          </Card>
        </div>
      </div>
      {last && <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm animate-rise flex items-center gap-3"><Repeat className="w-5 h-5 text-emerald-600" /><span><b>Data reused, 0 re-entry, {last.hours} hours saved</b> for the latest connection ({[...IMPORTERS, NEW_IMPORTER].find((x) => x.id === last.importerId).name}). One dataset now serves {conns.length} importers.</span></div>}
      <Modal open={sim} onClose={() => setSim(false)} title="New importer connects"><StepRunner title="Nordic Rebar AB (Gothenburg) connects" subtitle="Anadolu Çelik is already onboarded"
        steps={['Importer accepts producer’s shared dataset', 'Reusing validated Q1–Q4 data', 'Adapting to Excel template', 'Connection signed and logged']} onDone={done} /></Modal>
    </div>
  );
}
