import React, { useState } from 'react';
import { Share2, Lock, Eye, SlidersHorizontal, Link2, CheckCircle2, Unlink, ArrowRight, ShieldAlert, Repeat } from 'lucide-react';
import { useStore } from '../store/store.js';
import { useDerived } from '../store/derived.js';
import { IMPORTERS, QUARTERS, FIELD_GROUPS, PRESETS, PRODUCER } from '../data/seed.js';
import { flatProducts, hasAnyData } from '../lib/calc.js';
import { Button, Card, PageHeader, Badge, Modal, Check2, StepRunner, Empty, cx, Tip } from '../components/ui.jsx';
import { FORMAT_ICON } from './Pain.jsx';

function ConnectionAnim({ ids }) {
  const imps = IMPORTERS.filter((i) => ids.includes(i.id));
  const ys = imps.map((_, i) => 40 + (i * 200) / Math.max(1, imps.length - 1 || 1));
  return (
    <svg viewBox="0 0 520 280" className="w-full max-h-72">
      {imps.map((imp, i) => <path key={imp.id} d={`M 130 140 C 260 140, 260 ${ys[i] + 20}, 390 ${ys[i] + 20}`} fill="none" stroke="#2f7cf6" strokeWidth="2.5" strokeLinecap="round" className="animate-drawIn" style={{ '--len': 300, strokeDasharray: 300, animationDelay: `${i * 220}ms` }} />)}
      <g><rect x="10" y="100" width="120" height="80" rx="14" fill="#16356b" /><text x="70" y="136" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">Anadolu</text><text x="70" y="154" textAnchor="middle" fill="#8ec2ff" fontSize="11">Çelik</text></g>
      {imps.map((imp, i) => (
        <g key={imp.id} className="animate-pop" style={{ animationDelay: `${600 + i * 220}ms` }}>
          <rect x="390" y={ys[i]} width="120" height="40" rx="10" fill="#fff" stroke="#10b981" strokeWidth="2" />
          <text x="450" y={ys[i] + 18} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0b1b33">{imp.short}</text>
          <text x="450" y={ys[i] + 32} textAnchor="middle" fontSize="9.5" fill="#10b981">● connected</text>
        </g>
      ))}
    </svg>
  );
}

export default function Sharing() {
  const { perms, setPerm, connections, shareWith, revoke, hierarchy, data, imported, go, setRole, reuse, toast, ensureStage } = useStore();
  const { status, issues, validated } = useDerived();
  const [fieldsFor, setFieldsFor] = useState(null);
  const [run, setRun] = useState(null); // {ids, phase, done}

  if (!imported) return <Empty icon={Share2} title="Nothing to share yet" text="Import and validate your data first. Then decide, per importer, exactly what they see." action={<><Button onClick={() => go('import')}>Go to import</Button><Button variant="secondary" onClick={() => ensureStage('fixed')}>Skip (demo)</Button></>} />;

  const prods = flatProducts(hierarchy).filter((p) => hasAnyData(data, p.id));
  const toggle = (id, key, v) => { const cur = perms[id][key]; setPerm(id, { [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }); };
  const eff = (id) => ({ products: perms[id].products.filter((p) => prods.some((x) => x.id === p)), periods: perms[id].periods.filter((q) => validated.includes(q)) });
  const canShare = (id) => eff(id).products.length && eff(id).periods.length && perms[id].fields.length;
  const start = (ids) => setRun({ ids, phase: 'running', done: [] });
  const finish = () => { const done = shareWith(run.ids); setRun((r) => ({ ...r, phase: 'done', done })); };
  const blockedQs = QUARTERS.filter((q) => !validated.includes(q));
  const fe = FIELD_GROUPS.find((f) => f.id === fieldsFor);
  const connCount = Object.keys(connections).length;
  const lastReuse = reuse[reuse.length - 1];

  return (
    <div>
      <PageHeader eyebrow="Deliver" title="Sharing & permissions" desc="You decide which importer sees which product, period and fields. Sharing creates a signed, revocable data connection."
        actions={<Button size="lg" icon={Share2} disabled={!IMPORTERS.every((i) => canShare(i.id))} data-tour="share-all" onClick={() => start(IMPORTERS.map((i) => i.id))}>Share with all {IMPORTERS.length}</Button>} />

      {blockedQs.length > 0 && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 flex items-center gap-3 animate-rise"><ShieldAlert className="w-5 h-5 shrink-0" />
          <div className="flex-1"><b>{blockedQs.join(', ')}</b> can’t be shared yet: {issues.length} open validation issue{issues.length > 1 ? 's' : ''}. Validated periods can be shared now.</div>
          <Button size="sm" variant="secondary" onClick={() => go('validation')}>Resolve issues</Button></div>
      )}

      <Card className="overflow-hidden animate-rise">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-ink-500 bg-ink-50">
              <th className="px-5 py-3 font-medium">Importer</th>
              <th className="font-medium">Products they can see</th><th className="font-medium">Periods</th><th className="font-medium">Fields</th><th className="font-medium">Status</th><th className="pr-5" />
            </tr></thead>
            <tbody>
              {IMPORTERS.map((imp) => {
                const p = perms[imp.id]; const c = connections[imp.id]; const F = FORMAT_ICON[imp.outFormat];
                return (
                  <tr key={imp.id} className="border-t border-ink-100 align-top">
                    <td className="px-5 py-4 min-w-[190px]"><div className="font-semibold">{imp.name}</div><div className="text-xs text-ink-500">{imp.city}</div><div className="mt-1.5"><Badge tone="slate" icon={F}>{imp.outLabel}</Badge></div></td>
                    <td className="py-4 pr-3"><div className="space-y-1.5">{prods.map((pr) => <Check2 key={pr.id} checked={p.products.includes(pr.id)} onChange={() => toggle(imp.id, 'products', pr.id)}><span className="text-[13px]">{pr.name} <span className="text-ink-400">{pr.cn}</span></span></Check2>)}</div></td>
                    <td className="py-4 pr-3"><div className="flex gap-1.5">{QUARTERS.map((q) => {
                      const ok = validated.includes(q); const on = p.periods.includes(q);
                      return <Tip key={q} text={ok ? `${q} 2026` : `${q} needs validation first`}><button disabled={!ok} onClick={() => toggle(imp.id, 'periods', q)} className={cx('px-2.5 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1', !ok ? 'bg-ink-50 text-ink-300 border-ink-100 cursor-not-allowed' : on ? 'bg-sea-600 text-white border-sea-600' : 'bg-white border-ink-200 text-ink-700 hover:border-sea-300')}>{!ok && <Lock className="w-3 h-3" />}{q}</button></Tip>;
                    })}</div></td>
                    <td className="py-4 pr-3">
                      <button onClick={() => setFieldsFor(imp.id)} className="group inline-flex items-center gap-2 rounded-lg border border-ink-200 px-2.5 py-1.5 hover:border-sea-300 hover:bg-sea-50 transition"><SlidersHorizontal className="w-3.5 h-3.5 text-sea-600" /><span className="text-xs font-medium whitespace-nowrap">{p.fields.length} of {FIELD_GROUPS.length} groups</span></button>
                      <div className="text-[11px] mt-1.5 flex items-center gap-1 text-ink-500">{p.fields.includes('commercial') ? <><Eye className="w-3 h-3 text-amber-600" /> commercial data visible</> : <><Lock className="w-3 h-3" /> commercial data hidden</>}</div>
                    </td>
                    <td className="py-4 pr-3">{c ? <div><Badge tone="green" icon={Link2}>Connected</Badge><div className="text-[11px] text-ink-500 mt-1">{c.periods.length} periods · {c.products.length} products</div></div> : <Badge tone="slate">Not shared</Badge>}</td>
                    <td className="pr-5 py-4 text-right"><div className="flex flex-col items-end gap-1.5">
                      <Button size="sm" variant={c ? 'secondary' : 'primary'} disabled={!canShare(imp.id)} onClick={() => start([imp.id])}>{c ? 'Update' : 'Share'}</Button>
                      <div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => go('outputs', { importer: imp.id })}>Preview</Button>{c && <Button size="sm" variant="ghost" icon={Unlink} onClick={() => revoke(imp.id)}>Revoke</Button>}</div>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {connCount > 0 && lastReuse && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-sm animate-rise"><Repeat className="w-5 h-5 text-emerald-600" /><span><b>Data reused, 0 re-entry.</b> {connCount} connections created from one dataset, about <b>{reuse.reduce((a, r) => a + r.hours, 0).toFixed(0)} hours saved</b> vs re-sending manually (illustrative).</span><Button className="ml-auto" size="sm" variant="secondary" onClick={() => go('network')}>See network</Button></div>
      )}

      <Modal open={!!fieldsFor} onClose={() => setFieldsFor(null)} title={`Fields shared with ${IMPORTERS.find((i) => i.id === fieldsFor)?.short || ''}`} footer={<Button onClick={() => setFieldsFor(null)}>Done</Button>}>
        {fieldsFor && <>
          <div className="flex flex-wrap gap-2 mb-4">{PRESETS.map((pr) => <button key={pr.id} onClick={() => setPerm(fieldsFor, { fields: pr.fields })} className="px-3 py-1.5 rounded-full text-xs font-medium bg-sea-50 text-sea-700 hover:bg-sea-100">{pr.label}</button>)}</div>
          <div className="space-y-1">
            {FIELD_GROUPS.map((f) => (
              <div key={f.id} className={cx('flex items-center gap-3 p-3 rounded-xl', f.sensitive ? 'bg-amber-50/60' : 'hover:bg-ink-50')}>
                <Check2 checked={perms[fieldsFor].fields.includes(f.id)} onChange={() => toggle(fieldsFor, 'fields', f.id)}><span className="font-medium">{f.label}</span></Check2>
                <span className="text-xs text-ink-500 flex-1">{f.hint}</span>{f.sensitive && <Badge tone="amber" icon={Lock}>Sensitive</Badge>}
              </div>
            ))}
          </div>
        </>}
      </Modal>

      <Modal open={!!run} onClose={() => run?.phase === 'done' && setRun(null)} wide={run?.phase === 'done'} title={run?.phase === 'done' ? 'Data connections established' : 'Sharing your dataset'}>
        {run?.phase === 'running' && <StepRunner title={`Sharing with ${run.ids.length === 1 ? IMPORTERS.find((i) => i.id === run.ids[0]).short : `${run.ids.length} importers`}`} subtitle="Producer-controlled · signed · logged"
          steps={['Validating dataset (100% quality)', 'Applying per-importer permissions', `Adapting to ${run.ids.length > 1 ? 'four formats' : IMPORTERS.find((i) => i.id === run.ids[0]).outLabel}`, 'Signing with the trust layer', 'Delivering and logging the connection']} onDone={finish} />}
        {run?.phase === 'done' && (
          <div className="animate-rise">
            <div className="flex items-center gap-2 text-emerald-700 font-medium mb-1"><CheckCircle2 className="w-5 h-5" /> {run.done.length} data connection{run.done.length === 1 ? '' : 's'} established</div>
            <ConnectionAnim ids={run.done} />
            {lastReuse && connCount > 1 && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm flex items-center gap-2"><Repeat className="w-4 h-4 text-emerald-600" /> <span><b>Data reused, 0 re-entry.</b> {reuse.length} additional importer{reuse.length > 1 ? 's' : ''} connected without typing a number: ≈{reuse.reduce((a, r) => a + r.hours, 0).toFixed(0)} h saved.</span></div>}
            <div className="flex justify-end gap-2 mt-5"><Button variant="secondary" onClick={() => setRun(null)}>Stay here</Button>
              <Button variant="secondary" onClick={() => { setRun(null); go('network'); }}>Network effect</Button>
              <Button iconRight={ArrowRight} onClick={() => { setRun(null); setRole('importer'); useStore.getState().go('supplier', { id: 'anadolu' }); }}>See it as the importer</Button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
