import React, { useState } from 'react';
import { Download, Eye, FileOutput, Info, Link2 } from 'lucide-react';
import { useStore } from '../store/store.js';
import { useDerived } from '../store/derived.js';
import { IMPORTERS, FIELD_GROUPS } from '../data/seed.js';
import { flatProducts, hasAnyData, delay } from '../lib/calc.js';
import { buildRows, download } from '../lib/outputs.js';
import FormatPreview, { exportFile } from '../components/FormatPreview.jsx';
import { Button, Card, PageHeader, Badge, Empty, cx } from '../components/ui.jsx';
import { FORMAT_ICON } from './Pain.jsx';

export default function Outputs() {
  const { route, go, connections, perms, data, hierarchy, periods, imported, toast, ensureStage } = useStore();
  const { validated } = useDerived();
  const [sel, setSel] = useState(route.params?.importer || 'baltic');
  const [busy, setBusy] = useState(false);
  if (!imported) return <Empty icon={FileOutput} title="No dataset to format yet" text="Once your data is imported, this page shows it in each importer’s preferred format." action={<><Button onClick={() => go('import')}>Go to import</Button><Button variant="secondary" onClick={() => ensureStage('fixed')}>Skip (demo)</Button></>} />;

  const imp = IMPORTERS.find((i) => i.id === sel);
  const conn = connections[sel];
  const prodIds = flatProducts(hierarchy).filter((p) => hasAnyData(data, p.id)).map((p) => p.id);
  const eff = conn || { products: perms[sel].products.filter((p) => prodIds.includes(p)), periods: perms[sel].periods.filter((q) => validated.includes(q)), fields: perms[sel].fields };
  const rows = buildRows({ conn: eff, data, hierarchy });
  const version = eff.periods.length ? Math.max(...eff.periods.map((q) => periods[q].version)) : 1;

  const dl = async () => { setBusy(true); await delay(700, 1000); const f = exportFile(imp, rows, version); download(f.name, f.content, f.mime); setBusy(false); toast(`Downloaded ${f.name} (mock file)`); };

  return (
    <div>
      <PageHeader eyebrow="Deliver" title="Importer-specific output" desc="One dataset, four renderings. C-Matic adapts the same validated numbers to each importer’s preferred format, respecting their permissions." />
      <div className="grid md:grid-cols-4 gap-3 mb-5">
        {IMPORTERS.map((i) => {
          const F = FORMAT_ICON[i.outFormat];
          return (
            <button key={i.id} onClick={() => setSel(i.id)} className={cx('text-left p-4 rounded-2xl border transition animate-rise', sel === i.id ? 'border-sea-500 bg-sea-50 shadow-glow' : 'border-ink-200 bg-white hover:border-sea-300')}>
              <div className="flex items-center justify-between"><div className={cx('w-9 h-9 rounded-lg flex items-center justify-center', sel === i.id ? 'bg-sea-600 text-white' : 'bg-ink-100 text-ink-500')}><F className="w-[18px] h-[18px]" /></div>{connections[i.id] ? <Badge tone="green" icon={Link2}>Live</Badge> : <Badge>Preview</Badge>}</div>
              <div className="font-semibold mt-3 text-sm">{i.name}</div><div className="text-xs text-ink-500">{i.outLabel}</div>
            </button>
          );
        })}
      </div>
      <Card className="animate-rise" key={sel}>
        <div className="p-5 border-b border-ink-100 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px]">
            <div className="font-semibold">{imp.name} receives: {imp.outLabel}</div>
            <div className="flex flex-wrap gap-1.5 mt-2">{eff.products.map((p) => <Badge key={p} tone="blue">{flatProducts(hierarchy).find((x) => x.id === p)?.name}</Badge>)}{eff.periods.map((q) => <Badge key={q} tone="slate">{q}</Badge>)}<span className="mx-1 text-ink-300">|</span>{FIELD_GROUPS.filter((f) => eff.fields.includes(f.id)).map((f) => <Badge key={f.id} tone="sea">{f.label}</Badge>)}</div>
          </div>
          <Button variant="secondary" icon={Eye} onClick={() => go('sharing')}>Edit permissions</Button>
          <Button icon={Download} loading={busy} disabled={!rows.length} onClick={dl}>Download</Button>
        </div>
        {!conn && <div className="px-5 py-2.5 bg-amber-50 text-xs text-amber-800 flex items-center gap-2 border-b border-amber-100"><Info className="w-3.5 h-3.5" /> Preview only: not shared with {imp.short} yet. Share it from the Sharing screen.</div>}
        <div className="p-5"><FormatPreview importer={imp} rows={rows} version={version} /></div>
      </Card>
    </div>
  );
}
