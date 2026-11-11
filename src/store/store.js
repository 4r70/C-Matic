import { create } from 'zustand';
import {
  QUARTERS, DEFAULT_PERMS, DEFAULT_FACTORIES, GOODS, PRODUCER, IMPORTERS, NEW_IMPORTER, buildHierarchy, buildSampleData, importerById, PROCESSES,
} from '../data/seed.js';
import { detectIssues, periodHasData, flatProducts, productName } from '../lib/calc.js';

export const HOURS_PER_SUBMISSION = 7.5;

const clock = () => new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
let uid = 1;
const nid = () => `n${uid++}`;

const emptyPeriods = () => Object.fromEntries(QUARTERS.map((q) => [q, { version: 0, shared: false, history: [] }]));
const pushHist = (p, text, bump = true) => {
  const v = bump ? p.version + 1 : p.version;
  return { version: v, shared: bump ? false : p.shared, history: [{ v, text, at: clock() }, ...p.history] };
};

const initial = () => ({
  role: 'producer',
  importerId: 'baltic',
  route: { name: 'pain', params: {} },
  invite: 'none', // none | sent | accepted
  invitePayload: null,
  onboarded: false,
  profile: { ...PRODUCER },
  hierarchy: null,
  reportingQuarters: [...QUARTERS],
  data: {},
  imported: false,
  resolved: [],
  periods: emptyPeriods(),
  perms: JSON.parse(JSON.stringify(DEFAULT_PERMS)),
  connections: {},
  reuse: [],
  extraImporter: false,
  requests: [],
  notifications: [],
  readReg: [],
  timers: { importAt: null, readyAt: null },
  tourOpen: false,
  tourStep: 0,
  copilotOpen: false,
  bellOpen: false,
  toasts: [],
});

export const useStore = create((set, get) => ({
  ...initial(),

  // ---- navigation / ui
  go: (name, params = {}) => set({ route: { name, params }, bellOpen: false }),
  setRole: (role) => set({ role, route: { name: role === 'importer' ? 'suppliers' : 'checklist', params: {} }, bellOpen: false }),
  setImporter: (importerId) => set({ importerId, route: { name: 'suppliers', params: {} } }),
  reset: () => set({ ...initial() }),
  toast: (msg, tone = 'ok') => {
    const id = nid();
    set((s) => ({ toasts: [...s.toasts, { id, msg, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3600);
  },
  notify: (text, audience = 'producer') =>
    set((s) => ({ notifications: [{ id: nid(), text, audience, at: clock(), unread: true }, ...s.notifications] })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, unread: false })) })),
  markReg: (id) => set((s) => ({ readReg: s.readReg.includes(id) ? s.readReg : [...s.readReg, id] })),
  toggleCopilot: (v) => set((s) => ({ copilotOpen: v ?? !s.copilotOpen })),
  toggleBell: (v) => set((s) => ({ bellOpen: v ?? !s.bellOpen })),
  startTour: () => set({ tourOpen: true, tourStep: 0 }),
  endTour: () => set({ tourOpen: false }),
  setTourStep: (i) => set({ tourStep: i }),

  // ---- invite / onboarding
  sendInvite: (payload) => {
    set({ invite: 'sent', invitePayload: payload });
    get().notify('Baltic Fasteners OÜ invited Anadolu Çelik to share CBAM data', 'producer');
  },
  acceptInvite: () => {
    set({ invite: 'accepted' });
    get().notify('Anadolu Çelik accepted the invitation from Baltic Fasteners OÜ', 'importer');
  },
  finishOnboarding: ({ profile, factories, goods, quarters }) => {
    set({
      onboarded: true,
      profile: { ...get().profile, ...profile },
      hierarchy: buildHierarchy({ factories, goods }),
      reportingQuarters: quarters,
    });
    get().notify('Anadolu Çelik finished onboarding', 'importer');
  },

  // ---- hierarchy
  addFactory: (name, city, route) =>
    set((s) => ({ hierarchy: { factories: [...s.hierarchy.factories, { id: 'f' + nid(), name, city, route, products: [] }] } })),
  addProduct: (factoryId, cn) =>
    set((s) => {
      const g = GOODS.find((x) => x.cn === cn);
      if (!g || flatProducts(s.hierarchy).some((p) => p.id === g.productId)) return {};
      return {
        hierarchy: {
          factories: s.hierarchy.factories.map((f) =>
            f.id === factoryId ? { ...f, products: [...f.products, { id: g.productId, cn: g.cn, name: g.name, processes: [...(PROCESSES[g.productId] || ['Production'])] }] } : f),
        },
      };
    }),
  addProcess: (productId, name) =>
    set((s) => ({
      hierarchy: { factories: s.hierarchy.factories.map((f) => ({ ...f, products: f.products.map((p) => (p.id === productId ? { ...p, processes: [...p.processes, name] } : p)) })) },
    })),
  removeProcess: (productId, name) =>
    set((s) => ({
      hierarchy: { factories: s.hierarchy.factories.map((f) => ({ ...f, products: f.products.map((p) => (p.id === productId ? { ...p, processes: p.processes.filter((x) => x !== name) } : p)) })) },
    })),

  // ---- data
  importSample: () => {
    const data = buildSampleData();
    const periods = emptyPeriods();
    QUARTERS.forEach((q) => { periods[q] = pushHist(periods[q], 'Imported from anadolu_celik_uretim_2026.xlsx'); });
    set({ data, imported: true, periods, resolved: [], timers: { importAt: Date.now(), readyAt: null } });
    get()._syncReady();
  },
  saveDataset: (pid, q, ds) => {
    const s = get();
    set({
      data: { ...s.data, [`${pid}:${q}`]: ds },
      periods: { ...s.periods, [q]: pushHist(s.periods[q], `Edited ${productName(s.hierarchy, pid)} manually${s.periods[q].shared ? ' (reopened after sharing)' : ''}`) },
    });
    get()._syncReady();
  },
  applyFix: (issueId) => {
    const s = get();
    const issue = detectIssues(s.data, s.hierarchy).find((i) => i.id === issueId);
    if (!issue || !issue.fix) return;
    const key = `${issue.productId}:${issue.q}`;
    set({
      data: { ...s.data, [key]: issue.fix(s.data[key]) },
      resolved: [...s.resolved, { id: issue.id, title: issue.title, productName: issue.productName, q: issue.q, fixLabel: issue.fixLabel, severity: issue.severity, at: clock() }],
      periods: { ...s.periods, [issue.q]: pushHist(s.periods[issue.q], `Fixed: ${issue.title}`) },
    });
    get()._syncReady();
  },
  fixAll: () => {
    let guard = 0;
    while (guard++ < 20) {
      const s = get();
      const next = detectIssues(s.data, s.hierarchy).find((i) => i.fix);
      if (!next) break;
      get().applyFix(next.id);
    }
  },
  _syncReady: () => {
    const s = get();
    if (!s.imported || s.timers.readyAt) return;
    if (!detectIssues(s.data, s.hierarchy).length) set({ timers: { ...s.timers, readyAt: Date.now() } });
  },
  revisePeriod: (q) => {
    const s = get();
    set({ periods: { ...s.periods, [q]: pushHist(s.periods[q], 'New version opened for changes') } });
    get().toast(`${q} 2026 reopened as v${s.periods[q].version + 1} (draft)`);
  },

  // ---- sharing
  setPerm: (importerId, patch) => set((s) => ({ perms: { ...s.perms, [importerId]: { ...s.perms[importerId], ...patch } } })),
  shareWith: (ids) => {
    const s = get();
    const issues = detectIssues(s.data, s.hierarchy);
    const okPeriods = QUARTERS.filter((q) => periodHasData(s.data, q) && !issues.some((i) => i.q === q));
    const conns = { ...s.connections };
    const periods = JSON.parse(JSON.stringify(s.periods));
    const reuse = [...s.reuse];
    let count = Object.keys(conns).length;
    const done = [];
    ids.forEach((id) => {
      const pm = s.perms[id];
      const prods = pm.products.filter((p) => flatProducts(s.hierarchy).some((x) => x.id === p));
      const pers = pm.periods.filter((q) => okPeriods.includes(q));
      if (!prods.length || !pers.length) return;
      const imp = id === 'nordic' ? NEW_IMPORTER : importerById(id);
      const existed = !!conns[id];
      conns[id] = { importerId: id, products: prods, periods: pers, fields: pm.fields, since: existed ? conns[id].since : clock(), updated: clock(), format: imp.outFormat };
      pers.forEach((q) => { periods[q].shared = true; periods[q].history = [{ v: periods[q].version, text: `${existed ? 'Updated' : 'Shared'} with ${imp.short}`, at: clock() }, ...periods[q].history]; });
      if (!existed) {
        if (count >= 1) reuse.push({ importerId: id, periods: pers.length, hours: +(pers.length * HOURS_PER_SUBMISSION).toFixed(1), at: clock() });
        count++;
      }
      done.push(id);
    });
    if (!done.length) return [];
    set({ connections: conns, periods, reuse });
    done.forEach((id) => get().notify(`Data connection established with ${(id === 'nordic' ? NEW_IMPORTER : importerById(id)).name}`, 'producer'));
    return done;
  },
  revoke: (id) => {
    const conns = { ...get().connections };
    delete conns[id];
    const periods = JSON.parse(JSON.stringify(get().periods));
    QUARTERS.forEach((q) => { periods[q].shared = Object.values(conns).some((c) => c.periods.includes(q)); });
    set({ connections: conns, periods });
    get().toast('Connection revoked. The importer no longer has access.');
  },
  addExtraImporter: () => set({ extraImporter: true }),
  requestUpdate: (importerId, q) => {
    const imp = importerById(importerId);
    set((s) => ({ requests: [...s.requests, { importerId, q, at: clock() }] }));
    get().notify(`${imp.name} requested an updated dataset for ${q} 2026`, 'producer');
  },

  // ---- demo helper: jump forward so the tour never stalls
  ensureStage: (stage) => {
    const order = ['none', 'invited', 'accepted', 'onboarded', 'imported', 'fixed', 'shared'];
    const want = order.indexOf(stage);
    if (want >= 1 && get().invite === 'none') get().sendInvite({ contact: 'Mari Tamm', message: 'Please share your CBAM data via C-Matic.' });
    if (want >= 2 && get().invite !== 'accepted') get().acceptInvite();
    if (want >= 3 && !get().onboarded) get().finishOnboarding({ profile: {}, factories: DEFAULT_FACTORIES, goods: ['7318', '7213', '7214'], quarters: QUARTERS });
    if (want >= 4 && !get().imported) get().importSample();
    if (want >= 5) get().fixAll();
    if (want >= 6 && !Object.keys(get().connections).length) get().shareWith(IMPORTERS.map((i) => i.id));
  },
}));

export const stageDone = (s) => ({
  invited: s.invite !== 'none',
  accepted: s.invite === 'accepted',
  onboarded: s.onboarded,
  imported: s.imported,
  shared: Object.keys(s.connections).length > 0,
});
