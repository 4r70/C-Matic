import React, { useState } from 'react';
import { Scale, Activity, CheckCheck, Flag } from 'lucide-react';
import { useStore } from '../store/store.js';
import { REG_FEED } from '../data/seed.js';
import { Card, PageHeader, Badge, Tabs, cx, Button } from '../components/ui.jsx';

const IMPACT = { High: 'red', Medium: 'amber', Low: 'slate' };

export default function Regulation() {
  const { readReg, markReg, notifications, role, markAllRead } = useStore();
  const [tab, setTab] = useState('reg');
  const [tag, setTag] = useState('All');
  const tags = ['All', ...new Set(REG_FEED.map((r) => r.tag))];
  const items = REG_FEED.filter((r) => tag === 'All' || r.tag === tag);
  const mine = notifications.filter((n) => n.audience === role);
  return (
    <div>
      <PageHeader eyebrow="Insights" title="Regulation tracker & notifications" desc="Generic, illustrative summaries of EU CBAM developments, matched to your CN codes. Not legal advice."
        actions={<Button variant="secondary" icon={CheckCheck} onClick={() => { REG_FEED.forEach((r) => markReg(r.id)); markAllRead(); }}>Mark all read</Button>} />
      <div className="flex flex-wrap items-center gap-4 mb-5">
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'reg', label: 'Regulation feed', icon: Scale }, { id: 'act', label: `Activity (${mine.length})`, icon: Activity }]} />
        {tab === 'reg' && <div className="flex gap-1.5 flex-wrap">{tags.map((t) => <button key={t} onClick={() => setTag(t)} className={cx('px-3 py-1.5 rounded-lg text-xs font-medium transition', tag === t ? 'bg-sea-600 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200')}>{t}</button>)}</div>}
      </div>
      {tab === 'reg' && (
        <div className="space-y-3">
          {items.map((r) => {
            const read = readReg.includes(r.id);
            return (
              <Card key={r.id} className={cx('p-5 animate-rise cursor-pointer transition hover:shadow-lift', !read && 'border-l-4 !border-l-sea-500')} onClick={() => markReg(r.id)}>
                <div className="flex flex-wrap items-center gap-2 mb-1.5"><Badge tone="violet">{r.tag}</Badge><Badge tone={IMPACT[r.impact]} icon={Flag}>{r.impact} impact</Badge>{r.cn.map((c) => <Badge key={c} tone="blue">CN {c}</Badge>)}<span className="text-xs text-ink-400 ml-auto">{r.date}</span></div>
                <div className={cx('font-semibold', read && 'text-ink-700')}>{r.title}</div>
                <p className="text-sm text-ink-500 mt-1 leading-relaxed">{r.body}</p>
              </Card>
            );
          })}
        </div>
      )}
      {tab === 'act' && (
        <Card className="divide-y divide-ink-100 animate-rise">
          {mine.length ? mine.map((n) => <div key={n.id} className="p-4 flex items-start gap-3"><Activity className="w-4 h-4 text-sea-600 mt-0.5" /><div className="flex-1 text-sm">{n.text}</div><div className="text-xs text-ink-400">{n.at}</div></div>) : <div className="p-10 text-center text-ink-500 text-sm">No activity yet. Actions in the demo (invites, connections, update requests) appear here.</div>}
        </Card>
      )}
    </div>
  );
}
