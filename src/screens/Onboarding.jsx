import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, CheckCircle2, Building2, Factory, Package, Flame, CalendarRange, Trash2 } from 'lucide-react';
import { useStore } from '../store/store.js';
import { GOODS, ROUTES, DEFAULT_FACTORIES, PRODUCER, QUARTERS, YEAR } from '../data/seed.js';
import { Button, Card, PageHeader, Field, Check2, cx, Badge, StepRunner, Empty } from '../components/ui.jsx';

const STEPS = [['Company', Building2], ['Factories', Factory], ['CBAM goods', Package], ['Production route', Flame], ['Reporting period', CalendarRange]];

export default function Onboarding() {
  const { invite, onboarded, finishOnboarding, go, ensureStage, profile } = useStore();
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [co, setCo] = useState({ company: profile.company, taxId: profile.taxId, country: 'Türkiye', city: 'Kocaeli', contact: profile.contact, email: profile.email });
  const [factories, setFactories] = useState(DEFAULT_FACTORIES.map((f) => ({ ...f })));
  const [goods, setGoods] = useState(['7318', '7213', '7214']);
  const [quarters, setQuarters] = useState([...QUARTERS]);
  const [nf, setNf] = useState('');

  if (invite !== 'accepted' && !onboarded) {
    return <Empty icon={CheckCircle2} title="Accept the invitation first" text="Onboarding starts after you accept the importer’s invitation." action={<><Button onClick={() => go('invitation')}>Open invitation</Button><Button variant="secondary" onClick={() => ensureStage('accepted')}>Skip (demo)</Button></>} />;
  }
  if (onboarded) {
    return (
      <Card className="max-w-xl mx-auto p-10 text-center animate-pop">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-9 h-9" /></div>
        <h2 className="text-2xl font-semibold mt-4">Onboarding complete</h2>
        <p className="text-ink-500 mt-2">{profile.company} is set up with {useStore.getState().hierarchy.factories.length} factories. Review the hierarchy or import your data.</p>
        <div className="mt-6 flex justify-center gap-2"><Button variant="secondary" onClick={() => go('hierarchy')}>Review setup</Button><Button iconRight={ArrowRight} onClick={() => go('import')}>Import data</Button></div>
      </Card>
    );
  }
  if (running) {
    return (
      <div className="pt-10">
        <StepRunner title="Creating your workspace" subtitle="Building the Manufacturer › Factory › Product › Process hierarchy"
          steps={['Registering company profile', 'Creating factories', 'Mapping CBAM goods to factories', 'Applying production routes', 'Opening reporting periods']}
          onDone={() => { finishOnboarding({ profile: { company: co.company, taxId: co.taxId, contact: co.contact, email: co.email }, factories, goods, quarters }); go('hierarchy'); }} />
      </div>
    );
  }
  const canNext = [co.company && co.country && co.city, factories.length > 0, goods.length > 0, true, quarters.length > 0][step];
  const next = () => (step < 4 ? setStep(step + 1) : setRunning(true));

  return (
    <div data-tour="wizard">
      <PageHeader eyebrow="Onboarding" title="Tell us about your company" desc="Five short steps. Everything is prefilled for the demo, so you can click straight through." />
      <div className="flex items-center gap-2 mb-5 overflow-x-auto">
        {STEPS.map(([l, I], i) => (
          <React.Fragment key={l}>
            <button onClick={() => i < step && setStep(i)} className={cx('flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition', i === step ? 'bg-sea-600 text-white shadow-sm' : i < step ? 'bg-sea-50 text-sea-700' : 'bg-ink-100 text-ink-400')}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : <I className="w-4 h-4" />} {l}
            </button>
            {i < 4 && <div className={cx('h-px w-6 shrink-0', i < step ? 'bg-sea-300' : 'bg-ink-200')} />}
          </React.Fragment>
        ))}
      </div>
      <Card className="p-6 md:p-8 animate-rise" key={step}>
        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Company name"><input className="input" value={co.company} onChange={(e) => setCo({ ...co, company: e.target.value })} /></Field>
            <Field label="Tax ID"><input className="input" value={co.taxId} onChange={(e) => setCo({ ...co, taxId: e.target.value })} /></Field>
            <Field label="Country"><select className="input" value={co.country} onChange={(e) => setCo({ ...co, country: e.target.value })}>{['Türkiye', 'India', 'Ukraine', 'Serbia', 'Egypt', 'United Kingdom'].map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="City"><input className="input" value={co.city} onChange={(e) => setCo({ ...co, city: e.target.value })} /></Field>
            <Field label="Contact person"><input className="input" value={co.contact} onChange={(e) => setCo({ ...co, contact: e.target.value })} /></Field>
            <Field label="Contact e-mail"><input className="input" value={co.email} onChange={(e) => setCo({ ...co, email: e.target.value })} /></Field>
          </div>
        )}
        {step === 1 && (
          <div>
            <Field label="Factories / installations" help="installation" />
            <div className="space-y-2.5 mt-2">
              {factories.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-ink-200 animate-pop">
                  <div className="w-9 h-9 rounded-lg bg-sea-50 text-sea-600 flex items-center justify-center"><Factory className="w-4 h-4" /></div>
                  <div className="flex-1"><div className="font-medium text-sm">{f.name}</div><div className="text-xs text-ink-500">{f.city}</div></div>
                  {factories.length > 1 && <button onClick={() => setFactories(factories.filter((x) => x.id !== f.id))} className="p-2 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <input className="input max-w-xs" placeholder="Add factory name" value={nf} onChange={(e) => setNf(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && nf.trim() && (setFactories([...factories, { id: 'x' + Date.now(), name: nf.trim(), city: 'Kocaeli', route: ROUTES[0] }]), setNf(''))} />
              <Button variant="secondary" icon={Plus} disabled={!nf.trim()} onClick={() => { setFactories([...factories, { id: 'x' + Date.now(), name: nf.trim(), city: 'Kocaeli', route: ROUTES[0] }]); setNf(''); }}>Add</Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <Field label="Which CBAM goods do you produce?" help="cn" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {GOODS.map((g) => {
                const on = goods.includes(g.cn);
                return (
                  <button key={g.cn} onClick={() => setGoods(on ? goods.filter((x) => x !== g.cn) : [...goods, g.cn])} className={cx('text-left p-4 rounded-xl border transition', on ? 'border-sea-500 bg-sea-50 shadow-glow' : 'border-ink-200 hover:border-sea-300')}>
                    <div className="flex items-center justify-between"><span className="num font-semibold">CN {g.cn}</span><Check2 checked={on} onChange={() => {}} /></div>
                    <div className="text-sm text-ink-700 mt-1">{g.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <Field label="Production route per factory" help="route" />
            <div className="space-y-3 mt-2">
              {factories.map((f, i) => (
                <div key={f.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-ink-200">
                  <div className="font-medium text-sm w-40">{f.name}</div>
                  <select className="input max-w-xs" value={f.route} onChange={(e) => setFactories(factories.map((x, j) => (j === i ? { ...x, route: e.target.value } : x)))}>{ROUTES.map((r) => <option key={r}>{r}</option>)}</select>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <Field label={`Reporting periods ${YEAR}`} help="period" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {QUARTERS.map((q) => {
                const on = quarters.includes(q);
                return <button key={q} onClick={() => setQuarters(on ? quarters.filter((x) => x !== q) : [...quarters, q])} className={cx('p-4 rounded-xl border text-left transition', on ? 'border-sea-500 bg-sea-50 shadow-glow' : 'border-ink-200 hover:border-sea-300')}><div className="font-semibold">{q} {YEAR}</div><div className="text-xs text-ink-500 mt-0.5">{{ Q1: 'Jan–Mar', Q2: 'Apr–Jun', Q3: 'Jul–Sep', Q4: 'Oct–Dec' }[q]}</div></button>;
              })}
            </div>
            <div className="mt-6 rounded-xl bg-ink-50 p-4 text-sm text-ink-700 flex flex-wrap gap-x-6 gap-y-1">
              <span><b>{co.company}</b></span><span>{factories.length} factories</span><span>{goods.length} CBAM goods</span><span>{quarters.length} periods</span>
            </div>
          </div>
        )}
        <div className="flex justify-between mt-8">
          <Button variant="ghost" icon={ArrowLeft} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
          <Button iconRight={step === 4 ? undefined : ArrowRight} disabled={!canNext} onClick={next} data-tour="wizard-next">{step === 4 ? 'Create workspace' : 'Continue'}</Button>
        </div>
      </Card>
    </div>
  );
}
