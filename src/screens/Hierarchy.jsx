import React, { useState } from 'react';
import { Building2, Factory, Package, Cog, Plus, X, ArrowRight, Layers } from 'lucide-react';
import { useStore } from '../store/store.js';
import { GOODS, ROUTES } from '../data/seed.js';
import { flatProducts } from '../lib/calc.js';
import { Button, Card, PageHeader, Badge, Empty, Help } from '../components/ui.jsx';

function AddProcess({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState('');
  if (!open) return <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-sea-700 px-2 py-1 rounded-full border border-dashed border-sea-300 hover:bg-sea-50"><Plus className="w-3 h-3" /> process</button>;
  const submit = () => { if (v.trim()) onAdd(v.trim()); setV(''); setOpen(false); };
  return <input autoFocus value={v} onChange={(e) => setV(e.target.value)} onBlur={submit} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="e.g. Annealing" className="input !py-1 !text-xs w-36" />;
}

export default function Hierarchy() {
  const { hierarchy, profile, addProcess, removeProcess, addProduct, addFactory, go, onboarded, ensureStage, toast } = useStore();
  const [nf, setNf] = useState('');
  if (!onboarded || !hierarchy) {
    return <Empty icon={Layers} title="Set up your company first" text="The hierarchy is created from the onboarding wizard." action={<><Button onClick={() => go('onboarding')}>Go to onboarding</Button><Button variant="secondary" onClick={() => ensureStage('onboarded')}>Skip (demo)</Button></>} />;
  }
  const have = flatProducts(hierarchy).map((p) => p.id);
  const available = GOODS.filter((g) => !have.includes(g.productId));
  return (
    <div>
      <PageHeader eyebrow="Setup" title="Manufacturer › Factory › Product › Process" desc="Each dataset hangs on this structure. Importers see the product-level result, never your internal plant layout, unless you share it."
        actions={<Button iconRight={ArrowRight} onClick={() => go('import')}>Continue to data import</Button>} />
      <div data-tour="hierarchy-tree" className="animate-rise">
        <Card className="p-5 mb-1 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-ink-900 text-white flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
          <div className="flex-1"><div className="text-xs text-ink-500 uppercase tracking-wider font-semibold">Manufacturer</div><div className="font-semibold text-lg">{profile.company}</div></div>
          <Badge tone="slate">{profile.taxId}</Badge>
        </Card>
        <div className="ml-6 pl-6 border-l-2 border-sea-100 space-y-4 pt-4">
          {hierarchy.factories.map((f) => (
            <div key={f.id} className="relative">
              <div className="absolute -left-6 top-7 w-6 border-t-2 border-sea-100" />
              <Card className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-sea-600 text-white flex items-center justify-center"><Factory className="w-5 h-5" /></div>
                  <div className="flex-1"><div className="text-xs text-ink-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">Factory <Help k="installation" /></div><div className="font-semibold">{f.name}</div><div className="text-xs text-ink-500">{f.city}</div></div>
                  <Badge tone="blue">{f.route}</Badge>
                </div>
                <div className="ml-5 pl-5 border-l-2 border-sea-100 space-y-3">
                  {f.products.map((p) => (
                    <div key={p.id} className="relative rounded-xl bg-ink-50 p-4">
                      <div className="absolute -left-5 top-6 w-5 border-t-2 border-sea-100" />
                      <div className="flex items-center gap-2.5">
                        <Package className="w-4 h-4 text-sea-600" /><span className="font-medium">{p.name}</span><Badge tone="slate">CN {p.cn}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-3 ml-6">
                        <Cog className="w-3.5 h-3.5 text-ink-400" />
                        {p.processes.map((pr) => (
                          <span key={pr} className="inline-flex items-center gap-1 text-xs bg-white border border-ink-200 rounded-full pl-2.5 pr-1 py-1">{pr}<button onClick={() => removeProcess(p.id, pr)} className="p-0.5 rounded-full hover:bg-ink-100 text-ink-400" aria-label={`Remove ${pr}`}><X className="w-3 h-3" /></button></span>
                        ))}
                        <AddProcess onAdd={(n) => { addProcess(p.id, n); toast(`Process “${n}” added`); }} />
                      </div>
                    </div>
                  ))}
                  {!f.products.length && <div className="text-sm text-ink-400">No products yet.</div>}
                  {available.length > 0 && (
                    <select className="input !w-auto !py-1.5 text-xs" value="" onChange={(e) => { if (e.target.value) { addProduct(f.id, e.target.value); toast('Product added. Import or enter its data next.'); } }}>
                      <option value="">+ Add product…</option>
                      {available.map((g) => <option key={g.cn} value={g.cn}>CN {g.cn} · {g.name}</option>)}
                    </select>
                  )}
                </div>
              </Card>
            </div>
          ))}
          <div className="flex gap-2">
            <input className="input max-w-xs" placeholder="Add another factory" value={nf} onChange={(e) => setNf(e.target.value)} />
            <Button variant="secondary" icon={Plus} disabled={!nf.trim()} onClick={() => { addFactory(nf.trim(), 'Kocaeli', ROUTES[0]); setNf(''); toast('Factory added'); }}>Add factory</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
