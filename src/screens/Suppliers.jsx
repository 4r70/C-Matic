import React, { useState } from 'react';
import { UserPlus, Upload, Search, Send, ArrowRight, TrendingDown, AlertOctagon, CheckCircle2, Mail, Info } from 'lucide-react';
import { useStore } from '../store/store.js';
import { useSuppliers, exposure } from '../store/suppliers.js';
import { importerById, STATUS_META, PRODUCER } from '../data/seed.js';
import { eurK, delay } from '../lib/calc.js';
import { Button, Card, Badge, PageHeader, Modal, Progress, cx, Help, Tip } from '../components/ui.jsx';

const FUNNEL = ['invited', 'onboarding', 'data_shared', 'verified'];
const BAR = { not_invited: 'bg-ink-300', invited: 'bg-amber-400', onboarding: 'bg-sea-300', data_shared: 'bg-sea-600', verified: 'bg-emerald-500' };

function InviteModal({ open, onClose }) {
  const { importerId, sendInvite, toast, setRole } = useStore();
  const imp = importerById(importerId);
  const [msg, setMsg] = useState(`Hi ${PRODUCER.contact.split(' ')[0]}, we need your CBAM data for 2026. Instead of another Excel template, please use C-Matic: enter your data once and share it with all your EU customers.`);
  const [state, setState] = useState('form');
  const send = async () => {
    setState('sending');
    await delay(800, 1100);
    sendInvite({ importerId, contact: imp.contact, message: msg });
    setState('sent');
    toast(`Invitation sent to ${PRODUCER.company}`);
  };
  const close = () => { setState('form'); onClose(); };
  return (
    <Modal open={open} onClose={close} title={state === 'sent' ? 'Invitation sent' : 'Invite a supplier to C-Matic'}>
      {state === 'sent' ? (
        <div className="text-center py-4 animate-rise">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-8 h-8" /></div>
          <p className="mt-3 font-medium">{PRODUCER.company} has been invited.</p>
          <p className="text-sm text-ink-500 mt-1">They receive an e-mail link. Nothing is shared until they accept.</p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="secondary" onClick={close}>Stay in importer view</Button>
            <Button iconRight={ArrowRight} data-tour="switch-producer" onClick={() => { close(); setRole('producer'); useStore.getState().go('invitation'); }}>Switch to producer view</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl bg-sea-50 border border-sea-100 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white text-sea-700 flex items-center justify-center font-semibold">AÇ</div>
            <div className="text-sm"><div className="font-semibold">{PRODUCER.company}</div><div className="text-ink-500">{PRODUCER.city}, {PRODUCER.country} · {PRODUCER.email}</div></div>
          </div>
          <div>
            <div className="label mb-1.5">Data requested</div>
            <div className="flex flex-wrap gap-1.5"><Badge tone="blue">CN 7318 Bolts</Badge><Badge tone="blue">CN 7213 Wire rod</Badge><Badge tone="slate">Q1–Q4 2026</Badge><Badge tone="slate">Embedded emissions</Badge></div>
          </div>
          <div>
            <div className="label mb-1.5">Personal message</div>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} className="input resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <Button icon={Send} loading={state === 'sending'} onClick={send} data-tour="send-invite">{state === 'sending' ? 'Sending…' : 'Send invitation'}</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Suppliers() {
  const { importerId, go, invite, toast, notify } = useStore();
  const imp = importerById(importerId);
  const list = useSuppliers();
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const counts = Object.fromEntries(Object.keys(STATUS_META).map((k) => [k, list.filter((s) => s.status === k).length]));
  const active = counts.data_shared + counts.verified;
  const activation = Math.round((active / list.length) * 100);
  const avgComp = Math.round(list.reduce((a, s) => a + s.completeness, 0) / list.length);
  const ex = list.map((s) => ({ s, e: exposure(s) }));
  const atRisk = ex.filter((x) => !x.e.hasData).reduce((a, x) => a + x.e.atDefault, 0);
  const avoided = ex.filter((x) => x.e.hasData).reduce((a, x) => a + x.e.avoided, 0);
  const rows = list.filter((s) => (filter === 'all' || s.status === filter) && s.name.toLowerCase().includes(q.toLowerCase()));

  const rowAction = (s) => {
    if (!s.isDemo) return null;
    if (s.status === 'not_invited') {
      if (invite === 'none') return <Button size="sm" icon={UserPlus} data-tour="invite-anadolu" onClick={(e) => { e.stopPropagation(); setInviteOpen(true); }}>Invite</Button>;
      return <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); notify(`${imp.name} requested a data connection`, 'producer'); toast('Connection request sent to the producer'); }}>Request connection</Button>;
    }
    if (s.status === 'invited') return <Button size="sm" variant="secondary" icon={Mail} onClick={(e) => { e.stopPropagation(); toast('Reminder sent'); }}>Remind</Button>;
    return null;
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${imp.name} · ${imp.city}`}
        title="Supplier dashboard"
        desc="Invite suppliers, track who has shared data and see how much cost default values put at risk."
        actions={<>
          <Button variant="secondary" icon={Upload} soon>Import supplier list</Button>
          <Button icon={UserPlus} onClick={() => setInviteOpen(true)}>Invite supplier</Button>
        </>}
      />

      <div className="grid md:grid-cols-4 gap-4 mb-5">
        <Card className="p-4 animate-rise">
          <div className="label flex items-center gap-1.5">Activation <Help k="default" /></div>
          <div className="flex items-end gap-2 mt-1"><div className="text-3xl font-semibold num">{activation}%</div><div className="text-xs text-ink-500 pb-1">target 33%</div></div>
          <Progress className="mt-2" value={(activation / 33) * 100} tone={activation >= 33 ? 'green' : 'amber'} />
          <div className="text-xs text-ink-500 mt-1.5">{active} of {list.length} suppliers shared data</div>
        </Card>
        <Card className="p-4 animate-rise">
          <div className="label">Avg. completeness</div>
          <div className="text-3xl font-semibold num mt-1">{avgComp}%</div>
          <Progress className="mt-2" value={avgComp} />
          <div className="text-xs text-ink-500 mt-1.5">across all {list.length} suppliers</div>
        </Card>
        <Card className="p-4 animate-rise border-red-100">
          <div className="label flex items-center gap-1.5 text-red-600"><AlertOctagon className="w-3.5 h-3.5" /> At risk with default values</div>
          <div className="text-3xl font-semibold num mt-1 text-red-600">{eurK(atRisk)}</div>
          <div className="text-xs text-ink-500 mt-1.5">per year · suppliers without data · illustrative</div>
        </Card>
        <Card className="p-4 animate-rise border-emerald-100">
          <div className="label flex items-center gap-1.5 text-emerald-700"><TrendingDown className="w-3.5 h-3.5" /> Avoided with actual data</div>
          <div className="text-3xl font-semibold num mt-1 text-emerald-600">{eurK(avoided)}</div>
          <div className="text-xs text-ink-500 mt-1.5">per year · vs default values · illustrative</div>
        </Card>
      </div>

      <Card className="p-5 mb-5 animate-rise">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Supplier funnel</div>
          <div className="text-xs text-ink-500">{list.length} suppliers</div>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-ink-100 gap-0.5">
          {Object.keys(STATUS_META).map((k) => <div key={k} className={cx('transition-all duration-700', BAR[k])} style={{ width: `${(counts[k] / list.length) * 100}%` }} />)}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
          {Object.entries(STATUS_META).map(([k, m]) => (
            <div key={k} className="flex items-center gap-2 text-sm"><span className={cx('w-2.5 h-2.5 rounded-full', BAR[k])} />{m.label}<b className="num">{counts[k]}</b></div>
          ))}
        </div>
      </Card>

      <Card className="animate-rise">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-ink-100">
          <div className="relative"><Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search suppliers" className="input !pl-9 w-56" /></div>
          <div className="flex gap-1 flex-wrap">
            {[['all', 'All'], ...Object.entries(STATUS_META).map(([k, m]) => [k, m.label])].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={cx('px-3 py-1.5 rounded-lg text-xs font-medium transition', filter === k ? 'bg-sea-600 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}>{l}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-ink-500 border-b border-ink-100">
              <th className="px-5 py-2.5 font-medium">Supplier</th><th className="font-medium">CN</th><th className="font-medium">Status</th><th className="font-medium w-40">Completeness</th>
              <th className="font-medium text-right">Volume t/yr</th><th className="font-medium text-right pr-2"><Tip text="Default-value cost exposure: tonnes × default intensity × illustrative carbon price"><span className="underline decoration-dotted">Exposure (EUR/yr)</span></Tip></th><th className="pr-5" />
            </tr></thead>
            <tbody>
              {rows.map((s) => {
                const e = exposure(s);
                return (
                  <tr key={s.id} data-tour={s.isDemo ? 'supplier-row-anadolu' : undefined} onClick={() => go('supplier', { id: s.id })} className={cx('border-b border-ink-100 last:border-0 hover:bg-sea-50/50 cursor-pointer transition', s.isDemo && 'bg-sea-50/30')}>
                    <td className="px-5 py-3"><div className="font-medium flex items-center gap-2">{s.name}{s.isDemo && <Badge tone="blue">Demo supplier</Badge>}</div><div className="text-xs text-ink-500">{s.country}</div></td>
                    <td className="num text-ink-700">{s.cn}</td>
                    <td><Badge tone={STATUS_META[s.status].tone}>{STATUS_META[s.status].label}</Badge></td>
                    <td><div className="flex items-center gap-2"><Progress value={s.completeness} tone={s.completeness >= 90 ? 'green' : s.completeness >= 50 ? 'sea' : 'amber'} className="flex-1" /><span className="text-xs num w-8 text-right text-ink-500">{Math.round(s.completeness)}%</span></div></td>
                    <td className="text-right num">{s.annualT.toLocaleString('en-US')}</td>
                    <td className="text-right pr-2 num">{e.hasData ? <span className="text-emerald-600 font-medium">−{eurK(e.avoided)} <span className="text-xs font-normal text-ink-400">avoided</span></span> : <span className="text-red-600 font-medium">{eurK(e.atDefault)}</span>}</td>
                    <td className="pr-5 text-right">{rowAction(s) || <ArrowRight className="w-4 h-4 text-ink-300 inline" />}</td>
                  </tr>
                );
              })}
              {!rows.length && <tr><td colSpan={7} className="text-center py-10 text-ink-500">No suppliers match.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 text-xs text-ink-500 flex items-center gap-1.5 border-t border-ink-100"><Info className="w-3.5 h-3.5" /> Exposure uses illustrative default intensities and a €75/tCO₂e reference price. Click a row for details.</div>
      </Card>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
