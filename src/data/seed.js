// All data in this prototype is mocked, seeded and deterministic. Emission values are illustrative.

export const PRODUCER = {
  company: 'Anadolu Çelik Sanayi A.Ş.',
  short: 'Anadolu Çelik',
  city: 'Kocaeli',
  country: 'Türkiye',
  contact: 'Elif Demir',
  email: 'elif.demir@anadolucelik.example',
  taxId: 'TR-4021187733',
};

export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
export const YEAR = 2026;
export const CARBON_PRICE = 75; // EUR per tCO2e, illustrative

export const IMPORTERS = [
  {
    id: 'baltic', name: 'Baltic Fasteners OÜ', short: 'Baltic Fasteners', city: 'Tallinn', cc: 'EE',
    painFormat: 'Excel', painDetail: 'Excel template v3, e-mailed each quarter',
    outFormat: 'excel', outLabel: 'Excel template', contact: 'Mari Tamm',
  },
  {
    id: 'rhein', name: 'Rhein Bau GmbH', short: 'Rhein Bau', city: 'Duisburg', cc: 'DE',
    painFormat: 'PDF', painDetail: 'Signed PDF declaration with 41 fields',
    outFormat: 'pdf', outLabel: 'PDF declaration', contact: 'Jonas Weber',
  },
  {
    id: 'delta', name: 'Delta Metals B.V.', short: 'Delta Metals', city: 'Rotterdam', cc: 'NL',
    painFormat: 'Portal', painDetail: 'Web portal, every value re-typed by hand',
    outFormat: 'api', outLabel: 'JSON / API payload', contact: 'Sanne de Vries',
  },
  {
    id: 'lyon', name: 'Lyon Acier SAS', short: 'Lyon Acier', city: 'Lyon', cc: 'FR',
    painFormat: 'E-mail', painDetail: 'Free-text e-mail with a pasted table',
    outFormat: 'email', outLabel: 'E-mail digest + CSV', contact: 'Camille Laurent',
  },
];
export const importerById = (id) => IMPORTERS.find((i) => i.id === id) || IMPORTERS[0];

export const NEW_IMPORTER = {
  id: 'nordic', name: 'Nordic Rebar AB', short: 'Nordic Rebar', city: 'Gothenburg', cc: 'SE',
  painFormat: 'Excel', painDetail: '', outFormat: 'excel', outLabel: 'Excel template', contact: 'Elin Berg',
};

export const GOODS = [
  { cn: '7318', name: 'Steel bolts & fasteners', productId: 'bolts', defaultFactory: 'izmit', range: [0.4, 2.0] },
  { cn: '7213', name: 'Wire rod', productId: 'wirerod', defaultFactory: 'gebze', range: [0.3, 1.2] },
  { cn: '7214', name: 'Rebar & bars', productId: 'rebar', defaultFactory: 'gebze', range: [0.3, 1.2] },
  { cn: '7208', name: 'Flat-rolled steel (hot)', productId: 'flat', defaultFactory: 'gebze', range: [0.3, 2.2] },
  { cn: '7326', name: 'Other steel articles', productId: 'articles', defaultFactory: 'izmit', range: [0.4, 2.2] },
  { cn: '2523', name: 'Cement', productId: 'cement', defaultFactory: 'gebze', range: [0.5, 1.0] },
];

export const ROUTES = ['EAF steelmaking', 'BF-BOF steelmaking', 'DRI + EAF', 'Finishing / downstream'];

export const DEFAULT_FACTORIES = [
  { id: 'gebze', name: 'Gebze Plant', city: 'Gebze, Kocaeli', route: 'EAF steelmaking' },
  { id: 'izmit', name: 'Izmit Works', city: 'İzmit, Kocaeli', route: 'Finishing / downstream' },
];

export const PROCESSES = {
  bolts: ['Cold heading', 'Heat treatment'],
  wirerod: ['EAF steelmaking', 'Wire rod rolling'],
  rebar: ['EAF steelmaking', 'Bar rolling'],
  flat: ['Hot strip rolling'],
  articles: ['Forming'],
  cement: ['Clinker grinding'],
};

export function buildHierarchy({ factories, goods }) {
  const f = factories.map((x) => ({ ...x, products: [] }));
  goods.forEach((cn) => {
    const g = GOODS.find((x) => x.cn === cn);
    if (!g) return;
    const target = f.find((x) => x.id === g.defaultFactory) || f[0];
    if (!target) return;
    target.products.push({ id: g.productId, cn: g.cn, name: g.name, processes: [...(PROCESSES[g.productId] || ['Production'])] });
  });
  return { factories: f };
}

export const FIELD_GROUPS = [
  { id: 'production', label: 'Production volumes', hint: 'Tonnes produced per period' },
  { id: 'intensity', label: 'Embedded emissions intensity', hint: 'tCO₂e per tonne of product' },
  { id: 'direct', label: 'Direct emissions', hint: 'Fuels, process and materials' },
  { id: 'indirect', label: 'Indirect emissions', hint: 'Electricity and grid factor' },
  { id: 'energy', label: 'Energy & fuel detail', hint: 'MWh, Nm³ gas, coal' },
  { id: 'materials', label: 'Raw material & precursor mix', hint: 'Scrap, pig iron, precursors' },
  { id: 'plant', label: 'Installation & route details', hint: 'Factory, production route, CN code' },
  { id: 'commercial', label: 'Commercial data', hint: 'Prices and customers', sensitive: true },
];

export const DEFAULT_PERMS = {
  baltic: { products: ['bolts', 'wirerod'], periods: ['Q1', 'Q2', 'Q3', 'Q4'], fields: ['production', 'intensity', 'direct', 'indirect', 'energy'] },
  rhein: { products: ['rebar', 'wirerod'], periods: ['Q1', 'Q2', 'Q3', 'Q4'], fields: ['production', 'intensity', 'direct', 'indirect'] },
  delta: { products: ['rebar'], periods: ['Q1', 'Q2', 'Q3'], fields: ['production', 'intensity', 'direct', 'indirect', 'materials', 'plant'] },
  lyon: { products: ['bolts'], periods: ['Q1', 'Q2', 'Q3', 'Q4'], fields: ['production', 'intensity'] },
  nordic: { products: ['rebar'], periods: ['Q1', 'Q2', 'Q3', 'Q4'], fields: ['production', 'intensity', 'direct', 'indirect'] },
};

export const PRESETS = [
  { id: 'emissions', label: 'Emissions only', fields: ['production', 'intensity', 'direct', 'indirect'] },
  { id: 'standard', label: 'Standard CBAM', fields: ['production', 'intensity', 'direct', 'indirect', 'energy', 'plant'] },
  { id: 'technical', label: 'Full technical', fields: ['production', 'intensity', 'direct', 'indirect', 'energy', 'materials', 'plant'] },
];

// Flow volumes of Anadolu Çelik towards each importer, used for the exposure indicator
export const FLOWS = {
  baltic: { t: 2400, product: 'bolts', def: 2.2 },
  rhein: { t: 6000, product: 'rebar', def: 1.7 },
  delta: { t: 4200, product: 'rebar', def: 1.7 },
  lyon: { t: 1500, product: 'bolts', def: 2.2 },
  nordic: { t: 3200, product: 'rebar', def: 1.7 },
};

// ---- sample spreadsheet --------------------------------------------------
const BASE = {
  wirerod: { production: 12400, scrapT: 12900, pigIronT: 600, ferroalloysT: 120, precursorT: 0, elecMWh: 5700, gasNm3: 1450000, fuelT: 310, processT: 620 },
  rebar: { production: 9600, scrapT: 10050, pigIronT: 420, ferroalloysT: 90, precursorT: 0, elecMWh: 4350, gasNm3: 1120000, fuelT: 240, processT: 480 },
  bolts: { production: 1850, scrapT: 0, pigIronT: 0, ferroalloysT: 0, precursorT: 1930, elecMWh: 1150, gasNm3: 210000, fuelT: 0, processT: 30 },
};
const QF = { Q1: 1.0, Q2: 1.05, Q3: 0.96, Q4: 1.02 };
const QEF = { Q1: 0.43, Q2: 0.42, Q3: 0.44, Q4: 0.43 };
const QE = { Q1: 1.0, Q2: 0.94, Q3: 1.08, Q4: 0.98 }; // energy efficiency drift per quarter
const r10 = (n) => Math.round(n / 10) * 10;

export function buildSampleData() {
  const out = {};
  Object.entries(BASE).forEach(([pid, b]) => {
    QUARTERS.forEach((q) => {
      const f = QF[q];
      const e = QE[q];
      out[`${pid}:${q}`] = {
        production: r10(b.production * f),
        scrapT: r10(b.scrapT * f),
        pigIronT: r10(b.pigIronT * f),
        ferroalloysT: r10(b.ferroalloysT * f),
        precursorT: r10(b.precursorT * f),
        elec: { value: r10(b.elecMWh * f * e), unit: 'MWh' },
        gridEF: QEF[q],
        gasNm3: r10(b.gasNm3 * f * e),
        fuelT: r10(b.fuelT * f * e),
        processT: r10(b.processT * f),
      };
    });
  });
  // planted issues
  out['wirerod:Q2'].elec = { value: out['wirerod:Q2'].elec.value * 1000, unit: 'MWh' }; // kWh figure labelled MWh
  out['wirerod:Q3'].gridEF = null; // missing grid factor
  out['bolts:Q4'].gasNm3 = out['bolts:Q4'].gasNm3 * 10; // extra digit
  return out;
}

export const SAMPLE_FILE = {
  name: 'anadolu_celik_uretim_2026.xlsx',
  sizeKb: 48,
  sheet: 'Uretim_Q1-Q4',
  columns: [
    { src: 'Donem', sample: '2026-Q1', field: 'period', conf: 99 },
    { src: 'Tesis', sample: 'Gebze', field: 'factory', conf: 96 },
    { src: 'GTIP_Kodu', sample: '7213', field: 'cn', conf: 98 },
    { src: 'Uretim_ton', sample: '12.400', field: 'production', conf: 97 },
    { src: 'Hurda_ton', sample: '12.900', field: 'scrapT', conf: 95 },
    { src: 'Pik_ton', sample: '600', field: 'pigIronT', conf: 93 },
    { src: 'Ferroalyaj_ton', sample: '120', field: 'ferroalloysT', conf: 94 },
    { src: 'Elektrik', sample: '5.700', field: 'elecValue', conf: 91 },
    { src: 'Elk_Birim', sample: 'MWh', field: 'elecUnit', conf: 90 },
    { src: 'Sebeke_EF', sample: '0,43', field: 'gridEF', conf: 88 },
    { src: 'Dogalgaz_Nm3', sample: '1.450.000', field: 'gasNm3', conf: 96 },
    { src: 'Hammadde_ton', sample: '0', field: 'precursorT', conf: 71, review: true },
    { src: 'Kok_ton', sample: '310', field: 'fuelT', conf: 64, review: true },
    { src: 'Proses_tCO2', sample: '620', field: 'processT', conf: 68, review: true },
  ],
};

export const MAP_FIELDS = [
  { id: 'period', label: 'Reporting period', req: true },
  { id: 'factory', label: 'Factory', req: true },
  { id: 'cn', label: 'CN code', req: true },
  { id: 'production', label: 'Production quantity (t)', req: true },
  { id: 'scrapT', label: 'Scrap input (t)' },
  { id: 'pigIronT', label: 'Pig iron input (t)' },
  { id: 'ferroalloysT', label: 'Ferroalloys (t)' },
  { id: 'precursorT', label: 'Purchased precursor (t)' },
  { id: 'elecValue', label: 'Electricity consumption', req: true },
  { id: 'elecUnit', label: 'Electricity unit', req: true },
  { id: 'gridEF', label: 'Grid emission factor (tCO₂/MWh)' },
  { id: 'gasNm3', label: 'Natural gas (Nm³)' },
  { id: 'fuelT', label: 'Other fuels: coal / coke (t)' },
  { id: 'processT', label: 'Process emissions (tCO₂)' },
];

// ---- importer-side suppliers ---------------------------------------------
const POOL = [
  ['Marmara Demir Sanayi', 'Türkiye', '7214'], ['Ege Cıvata A.Ş.', 'Türkiye', '7318'], ['Morava Steel d.o.o.', 'Serbia', '7213'],
  ['Dnipro Metiz LLC', 'Ukraine', '7318'], ['Pune Forgings Pvt Ltd', 'India', '7318'], ['Gujarat Rebar Works', 'India', '7214'],
  ['Delta Nile Steel', 'Egypt', '7214'], ['Gulf Wire Industries FZE', 'UAE', '7213'], ['Tianjin Fastener Co.', 'China', '7318'],
  ['Hai Phong Bolt JSC', 'Vietnam', '7318'], ['Busan Bolt Co.', 'South Korea', '7318'], ['Zenica Wire d.o.o.', 'Bosnia & Herz.', '7213'],
  ['Skopje Metal AD', 'North Macedonia', '7214'], ['Minas Rebar S.A.', 'Brazil', '7214'], ['Cape Wire (Pty)', 'South Africa', '7213'],
  ['Oran Fixation SPA', 'Algeria', '7318'], ['Java Steelworks', 'Indonesia', '7214'], ['Chisinau Wire SRL', 'Moldova', '7213'],
  ['Sheffield Fixings Ltd', 'United Kingdom', '7318'], ['Nordfjord Wire AS', 'Norway', '7213'], ['Kocaeli Tel Sanayi', 'Türkiye', '7213'],
  ['Bursa Cıvata Ltd', 'Türkiye', '7318'],
];
const STATUS_ROT = ['verified', 'data_shared', 'onboarding', 'data_shared', 'invited', 'verified', 'onboarding', 'data_shared', 'invited', 'onboarding', 'invited'];
const DEF_INT = { '7318': 2.2, '7213': 1.7, '7214': 1.7 };

export function buildSuppliers(importerId) {
  const idx = IMPORTERS.findIndex((i) => i.id === importerId);
  const off = Math.max(idx, 0) * 5;
  const list = [];
  for (let i = 0; i < 11; i++) {
    const [name, country, cn] = POOL[(off + i * 2) % POOL.length];
    const status = STATUS_ROT[(i + idx * 3) % STATUS_ROT.length];
    const annualT = 800 + ((i * 937 + idx * 311) % 4200);
    const completeness = { verified: 100, data_shared: 88 + ((i * 3) % 10), onboarding: 22 + ((i * 17) % 40), invited: 0 }[status];
    const actual = +(DEF_INT[cn] * (0.52 + ((i * 7) % 9) / 40)).toFixed(2);
    list.push({
      id: `s${idx}-${i}`, name, country, cn, status, annualT, completeness, actual,
      def: DEF_INT[cn], email: `contact@${name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)}.example`,
      lastUpdate: status === 'invited' ? '—' : `${2 + ((i * 5) % 26)} Oct 2026`,
    });
  }
  return list;
}

export const STATUS_META = {
  not_invited: { label: 'Not invited', tone: 'slate' },
  invited: { label: 'Invited', tone: 'amber' },
  onboarding: { label: 'Onboarding', tone: 'blue' },
  data_shared: { label: 'Data shared', tone: 'sea' },
  verified: { label: 'Verified', tone: 'green' },
};

// ---- regulation feed -----------------------------------------------------
export const REG_FEED = [
  { id: 'r1', date: '2026-11-04', tag: 'Default values', impact: 'High', cn: ['7318', '7213', '7214'], title: 'Updated default-value tables expected for iron & steel goods', body: 'Importers without supplier data may have to rely on default values that can include a markup. Actual supplier data typically lowers the declared figure. (Illustrative summary, check official sources.)' },
  { id: 'r2', date: '2026-10-28', tag: 'Reporting', impact: 'Medium', cn: [], title: 'Reminder: period-based reporting rhythm for importers', body: 'Importers report on a recurring cadence, so suppliers are asked for fresh period data at regular intervals. A reusable dataset reduces repeated requests.' },
  { id: 'r3', date: '2026-10-17', tag: 'Verification', impact: 'High', cn: ['7213', '7214'], title: 'Verification expectations for installation data under discussion', body: 'Guidance on accredited verification of installation-level emissions data is evolving. Keep source documents (meter reads, invoices) attached to datasets.' },
  { id: 'r4', date: '2026-10-02', tag: 'Scope', impact: 'Medium', cn: ['7318'], title: 'Possible extension to selected downstream steel articles', body: 'Policy discussions mention broader coverage of downstream products such as fasteners. Producers of articles may soon be asked for precursor emissions.' },
  { id: 'r5', date: '2026-09-21', tag: 'Methodology', impact: 'Low', cn: [], title: 'Clarification on electricity emission factors for indirect emissions', body: 'Rules on which grid factor to use for indirect emissions continue to be clarified. Record the source and year of the factor you apply.' },
  { id: 'r6', date: '2026-09-05', tag: 'Costs', impact: 'Medium', cn: [], title: 'Carbon price reference moves: plan exposure scenarios', body: 'The certificate price follows the EU carbon market. Importers often run scenarios comparing default values to actual supplier data.' },
];

export const GLOSSARY = {
  direct: { term: 'Direct emissions', text: 'Greenhouse gases released on your own site: burning gas or coal, chemical reactions in the furnace, and the emissions embedded in the raw materials you melt.' },
  indirect: { term: 'Indirect emissions', text: 'Emissions caused by the electricity you buy. Calculated as electricity used (MWh) × the grid emission factor (tCO₂ per MWh).' },
  embedded: { term: 'Embedded emissions', text: 'All emissions released to make one tonne of product, direct plus indirect. The headline number importers need for CBAM.' },
  precursor: { term: 'Precursor', text: 'A material you buy that is itself a CBAM good, like wire rod bought to make bolts. Its own emissions travel with it.' },
  cn: { term: 'CN code', text: 'The customs code (Combined Nomenclature) that identifies a product, e.g. 7213 for wire rod. It decides whether a good is in scope.' },
  route: { term: 'Production route', text: 'The way the steel is made, e.g. electric arc furnace (EAF) from scrap, or blast furnace (BF-BOF) from ore. Routes have very different footprints.' },
  gridEF: { term: 'Grid emission factor', text: 'How carbon-heavy your electricity grid is, in tCO₂ per MWh. Published by national or international sources. Required to turn kWh into emissions.' },
  period: { term: 'Reporting period', text: 'The time window your data covers. Importers usually ask for quarterly datasets.' },
  default: { term: 'Default values', text: 'Standard emission figures an importer must use when real supplier data is missing. They are intentionally conservative, so actual data usually saves money.' },
  installation: { term: 'Installation', text: 'A production site, here called a factory. Emissions are reported per installation and per product.' },
  quality: { term: 'Data-quality score', text: 'Share of checks passed. Missing values, unit mismatches and out-of-range intensities all lower it. 100% means the dataset is ready to share.' },
};

export const COPILOT = [
  { q: 'What is the difference between direct and indirect emissions?', k: ['direct', 'indirect'], a: 'Direct emissions happen on your site: gas, coal, process chemistry and the materials you melt. Indirect emissions come from the electricity you buy: MWh × the grid emission factor. C-Matic reports both and adds them up to the embedded emissions per tonne. (Illustrative explanation.)' },
  { q: 'Why does my data need a grid emission factor?', k: ['grid', 'factor', 'ef'], a: 'Without it electricity cannot be converted to tCO₂e, so the indirect part of your result would be missing. In the demo data, Q3 of wire rod has no factor. One click applies a published national average and records the source.' },
  { q: 'What happens if I do not provide data to my importer?', k: ['default', 'cost', 'exposure', 'without'], a: 'The importer falls back to default values, which are designed to be conservative. That usually means a higher declared figure and a higher cost for them, and often more pressure on you. Actual data from C-Matic replaces defaults.' },
  { q: 'Can importers see my commercial data?', k: ['commercial', 'see', 'hide', 'permission', 'privacy'], a: 'Only what you explicitly share. Sharing is set per importer, per product, per period and per field group. Commercial data is off by default and every share is logged as a data connection you can revoke.' },
  { q: 'What is a precursor?', k: ['precursor'], a: 'A precursor is an input that is itself a CBAM good. If Izmit Works buys wire rod to make bolts, the rod’s embedded emissions are carried into the bolts. C-Matic keeps that link in the Setup hierarchy.' },
  { q: 'Why is my quality score below 100%?', k: ['score', 'quality', '100'], a: '__score__' },
  { q: 'Which CN code is my product?', k: ['cn', 'code', 'bolt', 'rebar', 'wire'], a: 'Steel bolts are CN 7318, wire rod is CN 7213 and rebar is CN 7214. Your customs broker or the product’s customs declaration is the authoritative source. Pick them in Onboarding.' },
  { q: 'What does “verified” mean?', k: ['verified', 'verify', 'verification'], a: 'Verified means an accredited third party has reviewed the dataset. In this prototype the badge is shown for some suppliers on the importer side; the verifier workflow itself is on the roadmap.' },
];
