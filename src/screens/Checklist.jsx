import React from 'react';
import { CheckCircle2, Circle, ArrowRight, Zap, Mail, Rocket, Layers, FileSpreadsheet, ShieldCheck, Share2 } from 'lucide-react';
import { useStore, stageDone } from '../store/store.js';
import { useDerived } from '../store/derived.js';
import { Button, Card, PageHeader, cx, Ring, Badge } from '../components/ui.jsx';

export default function Checklist() {
  const s = useStore();
  const { go, ensureStage, role } = s;
  const d = stageDone(s);
  const { issues, score } = useDerived();
  const steps = [
    { id: 'invitation', icon: Mail, title: 'Accept invitation', text: 'Baltic Fasteners OÜ asked for your CBAM data.', done: d.accepted, cta: 'Open invitation' },
    { id: 'onboarding', icon: Rocket, title: 'Onboard your company', text: 'Company, factories, CBAM goods, production route, period.', done: d.onboarded, cta: 'Start onboarding' },
    { id: 'hierarchy', icon: Layers, title: 'Review setup hierarchy', text: 'Manufacturer › Factory › Product › Process.', done: d.onboarded, cta: 'Open setup' },
    { id: 'import', icon: FileSpreadsheet, title: 'Import your data once', text: 'Upload a spreadsheet and map its columns.', done: d.imported, cta: 'Import spreadsheet' },
    { id: 'validation', icon: ShieldCheck, title: 'Resolve validation issues', text: 'Reach a 100% data-quality score.', done: d.imported && issues.length === 0, cta: 'Open validation' },
    { id: 'sharing', icon: Share2, title: 'Share with importers', text: 'Per importer, product, period and field.', done: d.shared, cta: 'Open sharing' },
  ];
  const firstOpen = steps.find((x) => !x.done);
  const pct = Math.round((steps.filter((x) => x.done).length / steps.length) * 100);
  return (
    <div>
      <PageHeader
        eyebrow="Anadolu Çelik Sanayi A.Ş. · Producer workspace"
        title="Enter your CBAM data once."
        desc="Follow the steps below. Every importer you share with receives the same validated dataset, in their own format."
        actions={<Button variant="soft" icon={Zap} onClick={() => { ensureStage('fixed'); s.toast('Jumped ahead: dataset imported and validated'); go('results'); }}>Skip ahead: validated dataset</Button>}
      />
      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        <Card className="p-2 animate-rise">
          {steps.map((st, i) => {
            const next = firstOpen?.id === st.id;
            return (
              <div key={st.id} className={cx('flex items-center gap-4 p-4 rounded-xl transition', next && 'bg-sea-50/70')}>
                <div className={cx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', st.done ? 'bg-emerald-50 text-emerald-600' : next ? 'bg-sea-600 text-white' : 'bg-ink-100 text-ink-400')}>
                  {st.done ? <CheckCircle2 className="w-5 h-5" /> : <st.icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium flex items-center gap-2">{i + 1}. {st.title}{st.done && <Badge tone="green">Done</Badge>}</div>
                  <div className="text-sm text-ink-500">{st.text}</div>
                </div>
                <Button variant={next ? 'primary' : 'secondary'} size="sm" iconRight={ArrowRight} onClick={() => go(st.id)}>{st.done ? 'Review' : st.cta}</Button>
              </div>
            );
          })}
        </Card>
        <div className="space-y-4">
          <Card className="p-5 flex flex-col items-center animate-rise">
            <Ring value={d.imported ? score : 0} label="data quality" />
            <div className="text-sm text-ink-500 mt-3 text-center">{d.imported ? (issues.length ? `${issues.length} open issues` : 'Ready to share') : 'Import data to get a score'}</div>
          </Card>
          <Card className="p-5 animate-rise">
            <div className="label">Setup progress</div>
            <div className="text-3xl font-semibold num mt-1">{pct}%</div>
            <div className="text-xs text-ink-500 mt-1">{steps.filter((x) => x.done).length} of {steps.length} steps complete</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
