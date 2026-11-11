import React from 'react';
import {
  Waves, Mail, Rocket, Network, FileSpreadsheet, ShieldCheck, Leaf, CalendarRange, Share2, FileOutput, Users, Globe2, BarChart3, Calculator, Scale,
  RotateCcw, PlayCircle, Bell, MessageCircle, ClipboardList, Layers, PenLine, ChevronDown, Factory, Building2, CheckCircle2,
} from 'lucide-react';
import { useStore, stageDone } from './store/store.js';
import { useDerived } from './store/derived.js';
import { IMPORTERS } from './data/seed.js';
import { Logo, ToastHost, cx, Badge, Tip } from './components/ui.jsx';
import Tour from './components/Tour.jsx';
import Copilot from './components/Copilot.jsx';
import Bell_ from './components/Bell.jsx';
import Pain from './screens/Pain.jsx';
import Checklist from './screens/Checklist.jsx';
import Invitation from './screens/Invitation.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Hierarchy from './screens/Hierarchy.jsx';
import DataEntry from './screens/DataEntry.jsx';
import Import from './screens/Import.jsx';
import Validation from './screens/Validation.jsx';
import Results from './screens/Results.jsx';
import Periods from './screens/Periods.jsx';
import Sharing from './screens/Sharing.jsx';
import Outputs from './screens/Outputs.jsx';
import Suppliers from './screens/Suppliers.jsx';
import SupplierDetail from './screens/SupplierDetail.jsx';
import NetworkView from './screens/NetworkView.jsx';
import Metrics from './screens/Metrics.jsx';
import SavingsCalc from './screens/SavingsCalc.jsx';
import Regulation from './screens/Regulation.jsx';

const SCREENS = {
  pain: Pain, checklist: Checklist, invitation: Invitation, onboarding: Onboarding, hierarchy: Hierarchy, entry: DataEntry, import: Import,
  validation: Validation, results: Results, periods: Periods, sharing: Sharing, outputs: Outputs, suppliers: Suppliers, supplier: SupplierDetail,
  network: NetworkView, metrics: Metrics, calculator: SavingsCalc, regulation: Regulation,
};

const NAV = {
  producer: [
    { group: 'Story', items: [{ id: 'pain', label: "Today's pain", icon: Waves }] },
    { group: 'Get started', items: [
      { id: 'checklist', label: 'Overview', icon: ClipboardList },
      { id: 'invitation', label: 'Invitation', icon: Mail },
      { id: 'onboarding', label: 'Onboarding', icon: Rocket },
      { id: 'hierarchy', label: 'Setup hierarchy', icon: Layers },
    ] },
    { group: 'Data', items: [
      { id: 'entry', label: 'Data entry', icon: PenLine },
      { id: 'import', label: 'Import', icon: FileSpreadsheet },
      { id: 'validation', label: 'Validation', icon: ShieldCheck },
      { id: 'results', label: 'Emissions result', icon: Leaf },
    ] },
    { group: 'Deliver', items: [
      { id: 'periods', label: 'Reporting periods', icon: CalendarRange },
      { id: 'sharing', label: 'Sharing & permissions', icon: Share2 },
      { id: 'outputs', label: 'Importer formats', icon: FileOutput },
    ] },
    { group: 'Insights', items: [
      { id: 'network', label: 'Network effect', icon: Network },
      { id: 'metrics', label: 'Platform metrics', icon: BarChart3 },
      { id: 'calculator', label: 'Savings calculator', icon: Calculator },
      { id: 'regulation', label: 'Regulation tracker', icon: Scale },
    ] },
  ],
  importer: [
    { group: 'Story', items: [{ id: 'pain', label: "Today's pain", icon: Waves }] },
    { group: 'Suppliers', items: [{ id: 'suppliers', label: 'Supplier dashboard', icon: Users }] },
    { group: 'Insights', items: [
      { id: 'network', label: 'Network effect', icon: Network },
      { id: 'metrics', label: 'Platform metrics', icon: BarChart3 },
      { id: 'calculator', label: 'Savings calculator', icon: Calculator },
      { id: 'regulation', label: 'Regulation tracker', icon: Scale },
    ] },
  ],
};

function TopBar() {
  const { role, setRole, importerId, setImporter, reset, startTour, go, toggleCopilot, tourOpen, copilotOpen } = useStore();
  return (
    <header className="h-14 shrink-0 bg-white/90 backdrop-blur border-b border-ink-200/70 flex items-center gap-3 px-4 z-40 relative no-print">
      <button onClick={() => go('pain')} className="shrink-0" aria-label="Home"><Logo /></button>
      <div className="hidden xl:block text-xs text-ink-500 border-l border-ink-200 pl-3 ml-1">One producer, one CBAM dataset, many EU importers.</div>
      <div className="flex-1" />

      <div data-tour="role-switch" className="flex items-center p-1 rounded-xl bg-ink-100 text-sm">
        {[['producer', 'Producer', Factory], ['importer', 'Importer', Building2]].map(([id, label, Icon]) => (
          <button key={id} onClick={() => role !== id && setRole(id)} className={cx('px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition', role === id ? 'bg-white shadow-soft text-sea-700' : 'text-ink-500 hover:text-ink-900')}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>
      {role === 'importer' && (
        <div className="relative hidden md:block animate-pop">
          <select value={importerId} onChange={(e) => setImporter(e.target.value)} className="appearance-none text-sm font-medium bg-white border border-ink-200 rounded-lg pl-3 pr-8 py-2 outline-none focus:border-sea-500 cursor-pointer">
            {IMPORTERS.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-2.5 pointer-events-none text-ink-400" />
        </div>
      )}
      <div className="flex-1" />
      <Badge tone="violet" className="hidden lg:inline-flex">Demo · mocked data</Badge>
      <button data-tour="tour-btn" onClick={() => (tourOpen ? useStore.getState().endTour() : startTour())} className={cx('flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition', tourOpen ? 'bg-sea-600 text-white' : 'text-sea-700 bg-sea-50 hover:bg-sea-100')}>
        <PlayCircle className="w-4 h-4" /> <span className="hidden sm:inline">{tourOpen ? 'End tour' : 'Start tour'}</span>
      </button>
      <Tip text="CBAM copilot" side="bottom">
        <button onClick={() => toggleCopilot()} className={cx('p-2 rounded-lg transition', copilotOpen ? 'bg-sea-600 text-white' : 'text-ink-500 hover:bg-ink-100')} aria-label="CBAM copilot"><MessageCircle className="w-[18px] h-[18px]" /></button>
      </Tip>
      <Bell_ />
      <Tip text="Reset demo to the start" side="bottom">
        <button data-tour="reset" onClick={() => { reset(); }} className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-ink-700 hover:bg-ink-100 border border-ink-200">
          <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Reset demo</span>
        </button>
      </Tip>
    </header>
  );
}

function SideNav() {
  const s = useStore();
  const { issues } = useDerived();
  const items = NAV[s.role];
  const done = stageDone(s);
  const badge = (id) => {
    if (id === 'validation' && s.imported) return issues.length ? <Badge tone="red">{issues.length}</Badge> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (id === 'invitation' && s.invite === 'sent') return <span className="w-2 h-2 rounded-full bg-sea-500 animate-pulse" />;
    if (id === 'invitation' && s.invite === 'accepted') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (id === 'onboarding' && done.onboarded) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (id === 'import' && done.imported) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (id === 'sharing' && done.shared) return <Badge tone="green">{Object.keys(s.connections).length}</Badge>;
    return null;
  };
  return (
    <nav className="hidden lg:flex w-60 shrink-0 flex-col gap-5 overflow-y-auto border-r border-ink-200/70 bg-white/60 p-4 no-print">
      {items.map((g) => (
        <div key={g.group}>
          <div className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{g.group}</div>
          <div className="space-y-0.5">
            {g.items.map((it) => {
              const active = s.route.name === it.id || (it.id === 'suppliers' && s.route.name === 'supplier');
              return (
                <button key={it.id} data-tour={`nav-${it.id}`} onClick={() => s.go(it.id)} className={cx('w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition text-left', active ? 'bg-sea-50 text-sea-700' : 'text-ink-700 hover:bg-ink-100')}>
                  <it.icon className={cx('w-4 h-4 shrink-0', active ? 'text-sea-600' : 'text-ink-400')} />
                  <span className="flex-1 truncate">{it.label}</span>
                  {badge(it.id)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="mt-auto rounded-xl bg-gradient-to-br from-sea-600 to-sea-800 p-4 text-white">
        <div className="text-xs font-medium text-sea-200">Trust layer</div>
        <div className="text-sm font-semibold mt-0.5 leading-snug">X-Road for CBAM data</div>
        <div className="text-[11px] text-sea-200 mt-1.5 leading-relaxed">Estonian-made. Producer-controlled sharing, logged connections.</div>
      </div>
    </nav>
  );
}

function MobileNav() {
  const s = useStore();
  const flat = NAV[s.role].flatMap((g) => g.items);
  return (
    <div className="lg:hidden flex gap-1 overflow-x-auto px-3 py-2 border-b border-ink-200/70 bg-white no-print">
      {flat.map((it) => (
        <button key={it.id} onClick={() => s.go(it.id)} className={cx('px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap', s.route.name === it.id ? 'bg-sea-50 text-sea-700' : 'text-ink-600')}>{it.label}</button>
      ))}
    </div>
  );
}

export default function App() {
  const route = useStore((s) => s.route);
  const tourOpen = useStore((s) => s.tourOpen);
  const copilotOpen = useStore((s) => s.copilotOpen);
  const Screen = SCREENS[route.name] || Pain;
  return (
    <div className="h-full flex flex-col">
      <TopBar />
      <MobileNav />
      <div className="flex-1 flex min-h-0">
        <SideNav />
        <main id="main" className={cx('flex-1 overflow-y-auto transition-all', copilotOpen && 'xl:mr-[380px]')}>
          <div key={route.name + (route.params?.id || '')} className={cx('mx-auto max-w-6xl px-5 md:px-8 py-7', tourOpen ? 'pb-44' : 'pb-16')}>
            <Screen />
          </div>
        </main>
      </div>
      <Copilot />
      <Tour />
      <ToastHost />
    </div>
  );
}
