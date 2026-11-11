import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Download, Mail, ShieldCheck, Clock, Link2, Loader2 } from 'lucide-react';
import { useStore } from '../store/store.js';
import { useSuppliers, exposure } from '../store/suppliers.js';
import { importerById, STATUS_META, QUARTERS, YEAR, FIELD_GROUPS } from '../data/seed.js';
import { eurK, delay, fmt } from '../lib/calc.js';
import { buildRows, download } from '../lib/outputs.js';
import FormatPreview, { exportFile } from '../components/FormatPreview.jsx';
import { Button, Card, Badge, Modal, Progress, Tabs, Empty, cx, Illustrative } from '../components/ui.jsx';
import { Users } from 'lucide-react';

export default function SupplierDetail() {
  const { route, go, importerId, connections, data, hierarchy, periods, requestUpdate, toast, setRole } = useStore();
  const list = useSuppliers();
  const s = list.find((x) => x.id === route.params.id) || list[0];
  const imp = importerById(importerId);
  const conn = connections[importerId];
  const [tab, setTab] = useState('format');
  const [reqOpen, setReqOpen] = useState(false);
  const [reqQ, setReqQ] = useState('Q4');
  const [busy, setBusy] = useState(false);
  const [dl, setDl] = useState(false);
  const e = exposure(s);
  const allRequests = useStore((st) => st.requests);
  const requested = allRequests.filter((r) => r.importerId === importerId);
  const meta = STATUS_META[s.status];

  const rows = s.isDemo && conn ? buildRows({ conn, data, hierarchy }) : [];
  const version = s.isDemo && conn ? Math.max(...conn.periods.map((q) => periods[q].version)) : 1;

  const doRequest = async () => {
    setBusy(true); await delay(700, 1000); requestUpdate(importerId, reqQ); setBusy(false); setReqOpen(false);
    toast(`Update requested for ${reqQ} ${YEAR}. The producer has been notified.`);
  };
  const doDownload = async () => {
    setDl(true); await delay(700, 1000);
    const f = exportFile(imp, rows, version); download(f.name, f.content, f.mime); setDl(false); toast(`Downloaded ${f.name} (mock file)`);
  };

  const synth = QUARTERS.map((q, i) => ({ q, intensity: s.actual ? +(s.actual * (0.96 + i * 0.03)).toFixed(2) : null, status: s.status === 'verified' ? 'Verified' : s.status === 'data_shared' ? 'Received' : '—' }));

  return (
    <div>
      <button onClick={() => go('suppliers')} className="text-sm text-ink-500 hover:text-sea-700 flex items-center gap-1.5 mb-4"><ArrowLeft className="w-4 h-4" /> All suppliers</button>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6 animate-rise">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sea-600 text-white flex items-center justify-center text-lg font-semibold">{s.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}</div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{s.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-ink-500">{s.country} · CN {s.cn} <Badge tone={meta.tone}>{meta.label}</Badge>{s.status === 'verified' && <Badge tone="green" icon={ShieldCheck}>Verified</Badge>}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Mail} soon>Message</Button>
          <Button icon={RefreshCw} onClick={() => setReqOpen(true)} disabled={s.status === 'not_invited' || s.status === 'invited'}>Request update</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-5">
        <Card className="p-4"><div className="label">Completeness</div><div className="text-3xl font-semibold num mt-1">{Math.round(s.completeness)}%</div><Progress className="mt-2" value={s.completeness} tone={s.completeness >= 90 ? 'green' : 'sea'} /></Card>
        <Card className={cx('p-4', !e.hasData && 'border-red-100')}>
          <div className="label">Default-value exposure</div>
          <div className={cx('text-3xl font-semibold num mt-1', e.hasData ? 'text-ink-400 line-through decoration-1' : 'text-red-600')}>{eurK(e.atDefault)}</div>
          <div className="text-xs text-ink-500 mt-1">{s.annualT.toLocaleString('en-US')} t/yr × {s.def} t/t default × €75 <Illustrative /></div>
        </Card>
        <Card className={cx('p-4', e.hasData && 'border-emerald-100')}>
          <div className="label">With actual supplier data</div>
          <div className={cx('text-3xl font-semibold num mt-1', e.hasData ? 'text-emerald-600' : 'text-ink-300')}>{e.hasData ? eurK(e.actual) : '—'}</div>
          <div className="text-xs text-ink-500 mt-1">{e.hasData ? `${eurK(e.avoided)} per year avoided · ${s.actual?.toFixed(2)} t/t actual` : 'Available once the supplier shares data'}</div>
        </Card>
      </div>

      {s.isDemo && conn && (
        <Card className="animate-rise">
          <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-ink-100">
            <Tabs value={tab} onChange={setTab} tabs={[{ id: 'format', label: `In your format (${imp.outLabel})` }, { id: 'received', label: 'Received fields' }, { id: 'conn', label: 'Connection' }]} />
            <Button variant="secondary" icon={dl ? Loader2 : Download} loading={dl} onClick={doDownload}>Download {imp.outLabel}</Button>
          </div>
          <div className="p-5">
            {tab === 'format' && <div data-tour="format-preview"><FormatPreview importer={imp} rows={rows} version={version} /></div>}
            {tab === 'received' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5"><span className="text-sm text-ink-500 mr-1">Fields shared with you:</span>{FIELD_GROUPS.filter((f) => conn.fields.includes(f.id)).map((f) => <Badge key={f.id} tone="blue">{f.label}</Badge>)}</div>
                <div className="overflow-x-auto rounded-xl border border-ink-200">
                  <table className="text-sm w-full">
                    <thead><tr className="bg-ink-50 text-left text-xs text-ink-500">{rows[0] && Object.keys(rows[0]).map((c) => <th key={c} className="px-3 py-2 font-medium whitespace-nowrap">{c.replace(/_/g, ' ')}</th>)}</tr></thead>
                    <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-ink-100">{Object.values(r).map((v, j) => <td key={j} className="px-3 py-2 num whitespace-nowrap">{typeof v === 'number' ? fmt(v, v % 1 ? 3 : 0) : v ?? '—'}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                <div className="text-xs text-ink-500">Commercial data and anything outside these field groups is not visible to {imp.short}.</div>
              </div>
            )}
            {tab === 'conn' && (
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2"><div className="flex items-center gap-2"><Link2 className="w-4 h-4 text-sea-600" /> Data connection since <b>{conn.since}</b></div><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-sea-600" /> Last update <b>{conn.updated}</b> · v{version}</div><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sea-600" /> Producer-controlled, revocable, logged</div></div>
                <div><div className="label mb-1.5">Periods received</div><div className="flex gap-1.5">{conn.periods.map((q) => <Badge key={q} tone="green">{q} {YEAR}</Badge>)}</div>
                  {requested.length > 0 && <div className="mt-3 text-xs text-ink-500">Update requests sent: {requested.map((r) => `${r.q} (${r.at})`).join(', ')}</div>}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {s.isDemo && !conn && (
        <Empty icon={Users} title={s.status === 'not_invited' ? 'Anadolu Çelik has not been invited yet' : s.status === 'invited' ? 'Waiting for the producer to accept' : 'Onboarding in progress'}
          text={s.status === 'not_invited' ? 'Send an invitation from the supplier dashboard.' : 'Switch to the producer view to continue the story: accept, onboard, import, validate and share.'}
          action={<Button onClick={() => (s.status === 'not_invited' ? go('suppliers') : (setRole('producer'), go(s.status === 'invited' ? 'invitation' : 'checklist')))}>{s.status === 'not_invited' ? 'Back to dashboard' : 'Switch to producer view'}</Button>} />
      )}

      {!s.isDemo && (
        <Card className="p-5 animate-rise">
          <div className="font-semibold mb-3">Received dataset</div>
          {s.status === 'invited' || s.status === 'onboarding' ? (
            <div className="text-sm text-ink-500">{s.status === 'invited' ? `Invitation sent to ${s.email}. No data yet.` : 'Supplier accepted and is entering production data.'}
              <div className="mt-3"><Button variant="secondary" size="sm" icon={Mail} onClick={() => toast('Reminder sent')}>Send reminder</Button></div></div>
          ) : (
            <table className="w-full text-sm"><thead><tr className="text-left text-xs text-ink-500 border-b border-ink-100"><th className="py-2 font-medium">Period</th><th className="font-medium">Embedded tCO₂e/t</th><th className="font-medium">Status</th></tr></thead>
              <tbody>{synth.map((r) => <tr key={r.q} className="border-b border-ink-100 last:border-0"><td className="py-2">{r.q} {YEAR}</td><td className="num">{r.intensity?.toFixed(2)}</td><td><Badge tone={r.status === 'Verified' ? 'green' : 'blue'}>{r.status}</Badge></td></tr>)}</tbody></table>
          )}
        </Card>
      )}

      <Modal open={reqOpen} onClose={() => setReqOpen(false)} title="Request an update">
        <p className="text-sm text-ink-500">The supplier is notified and can re-share a new version of the dataset. No e-mail ping-pong.</p>
        <div className="mt-4"><div className="label mb-1.5">Period</div>
          <div className="flex gap-2">{QUARTERS.map((q) => <button key={q} onClick={() => setReqQ(q)} className={cx('px-4 py-2 rounded-lg text-sm font-medium border transition', reqQ === q ? 'bg-sea-600 text-white border-sea-600' : 'bg-white border-ink-200 hover:border-sea-300')}>{q} {YEAR}</button>)}</div></div>
        <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setReqOpen(false)}>Cancel</Button><Button loading={busy} icon={RefreshCw} onClick={doRequest}>Send request</Button></div>
      </Modal>
    </div>
  );
}
