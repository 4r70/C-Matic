import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useStore } from '../store/store.js';
import { Button } from './ui.jsx';

export const TOUR = [
  { role: 'producer', route: 'pain', ensure: 'none', target: 'pain-toggle', title: 'Today: one producer, four importers, four formats', text: 'Anadolu Çelik sends the same data 16 times a year, in Excel, PDF, a portal and e-mail. Flip the switch to see the C-Matic way.' },
  { role: 'importer', route: 'suppliers', ensure: 'none', target: 'invite-anadolu', title: 'Acquisition: the importer invites its supplier', text: 'Baltic Fasteners (Tallinn) is the entry point. Click “Invite” on Anadolu Çelik and send the invitation.' },
  { role: 'producer', route: 'invitation', ensure: 'invited', target: 'accept-btn', title: 'The producer receives the invite', text: 'Invited by Baltic Fasteners OÜ, Tallinn. Accept it. Nothing is shared until the producer decides.' },
  { role: 'producer', route: 'onboarding', ensure: 'accepted', target: 'wizard', title: 'Onboarding wizard', text: 'Company, country, factories, CBAM goods (CN codes), production route and reporting period. Prefilled for the demo, so just click through.' },
  { role: 'producer', route: 'hierarchy', ensure: 'onboarded', target: 'hierarchy-tree', title: 'Manufacturer › Factory › Product › Process', text: 'The structure that every dataset hangs on. Add a process or product inline if you like.' },
  { role: 'producer', route: 'import', ensure: 'onboarded', target: 'import-start', title: 'Enter data once: import a spreadsheet', text: 'Use the bundled sample file, then confirm the column mapping. Turkish headers are auto-detected.' },
  { role: 'producer', route: 'validation', ensure: 'imported', target: 'fix-all', title: 'Validation flags 3 issues', text: 'A unit mismatch, a missing grid factor and an outlier. Fix them one by one (or all at once) and watch the quality score reach 100%.' },
  { role: 'producer', route: 'results', ensure: 'fixed', target: 'results-chart', title: 'Embedded emissions, per product and period', text: 'tCO₂e per tonne, direct vs indirect. Illustrative formula, plausible shape.' },
  { role: 'producer', route: 'sharing', ensure: 'fixed', target: 'share-all', title: 'Share with all four importers, with different permissions', text: 'Each importer sees different products, periods and field groups. Commercial data stays hidden. Click “Share with all 4”.' },
  { role: 'importer', route: 'supplier', params: { id: 'anadolu' }, ensure: 'shared', target: 'format-preview', title: 'The importer receives the dataset in its own format', text: 'Baltic gets its Excel template. Switch importers in the top bar to see PDF, JSON/API and an e-mail digest.' },
  { role: 'producer', route: 'network', ensure: 'shared', target: 'network-graph', title: 'Network effect: data reused, zero re-entry', text: 'Every extra importer that connects to an onboarded producer costs the producer no new data entry. Try “Simulate new importer”.' },
  { role: 'producer', route: 'metrics', ensure: 'shared', target: 'metrics-kpis', title: 'Platform metrics', text: 'Verified connections, activation vs the 33% target, time-to-dataset, error rate and MRR. That is the story.' },
];

export default function Tour() {
  const { tourOpen, tourStep, setTourStep, endTour } = useStore();
  const step = TOUR[tourStep];

  const enter = (i) => {
    const s = TOUR[i];
    const st = useStore.getState();
    st.ensureStage(s.ensure);
    if (st.role !== s.role) useStore.setState({ role: s.role });
    if (s.role === 'importer' && st.importerId !== 'baltic') useStore.setState({ importerId: 'baltic' });
    st.go(s.route, s.params || {});
    setTourStep(i);
  };

  useEffect(() => {
    if (!tourOpen || !step) return undefined;
    let el;
    const find = () => {
      const n = document.querySelector(`[data-tour="${step.target}"]`);
      if (n && n !== el) { el?.classList.remove('tour-pulse'); el = n; n.classList.add('tour-pulse'); n.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    };
    const id = setInterval(find, 400);
    const t = setTimeout(find, 150);
    return () => { clearInterval(id); clearTimeout(t); el?.classList.remove('tour-pulse'); document.querySelectorAll('.tour-pulse').forEach((x) => x.classList.remove('tour-pulse')); };
  }, [tourOpen, tourStep]);

  useEffect(() => { if (tourOpen) enter(tourStep); }, [tourOpen]);

  if (!tourOpen || !step) return null;
  const last = tourStep === TOUR.length - 1;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[min(760px,94vw)] no-print animate-rise">
      <div className="rounded-2xl bg-ink-900 text-white shadow-lift p-4 pl-5 flex items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-sea-300">
            Guided demo · {tourStep + 1} / {TOUR.length}
            <span className="flex gap-1">{TOUR.map((_, i) => <span key={i} className={`h-1 rounded-full transition-all ${i === tourStep ? 'w-5 bg-sea-400' : i < tourStep ? 'w-1.5 bg-sea-600' : 'w-1.5 bg-ink-700'}`} />)}</span>
          </div>
          <div className="font-semibold mt-1">{step.title}</div>
          <div className="text-sm text-ink-300 mt-0.5 leading-snug">{step.text}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="!text-ink-300 hover:!bg-ink-700" icon={ChevronLeft} disabled={tourStep === 0} onClick={() => enter(tourStep - 1)}>Back</Button>
          <Button size="sm" iconRight={last ? undefined : ChevronRight} onClick={() => (last ? endTour() : enter(tourStep + 1))}>{last ? 'Finish' : 'Next'}</Button>
          <button onClick={endTour} className="p-1.5 rounded-lg hover:bg-ink-700 text-ink-300" aria-label="End tour"><X className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
