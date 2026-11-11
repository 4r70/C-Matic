import { GOODS, QUARTERS } from '../data/seed.js';

// Illustrative emission factors (tCO2e per unit). Not real regulatory values.
export const EF = { scrap: 0.03, pig: 1.9, ferro: 2.4, precursor: 0.7, gas: 0.00202, fuel: 2.85 };
export const AVG_GRID_EF = 0.43;

export const fmt = (n, d = 0) =>
  n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const eur = (n) => '€' + Math.round(n).toLocaleString('en-US');
export const eurK = (n) => (n >= 1e6 ? '€' + (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? '€' + Math.round(n / 1e3) + 'k' : '€' + Math.round(n));

export const toMWh = (elec) => (!elec || elec.value == null ? null : elec.unit === 'kWh' ? elec.value / 1000 : elec.value);

export function calc(ds) {
  if (!ds) return null;
  const materials = (ds.scrapT || 0) * EF.scrap + (ds.pigIronT || 0) * EF.pig + (ds.ferroalloysT || 0) * EF.ferro + (ds.precursorT || 0) * EF.precursor;
  const gas = (ds.gasNm3 || 0) * EF.gas;
  const fuel = (ds.fuelT || 0) * EF.fuel;
  const process = ds.processT || 0;
  const direct = materials + gas + fuel + process;
  const elecMWh = toMWh(ds.elec) || 0;
  const indirect = ds.gridEF == null ? null : elecMWh * ds.gridEF;
  const total = direct + (indirect || 0);
  const p = ds.production || 0;
  return {
    materials, gas, fuel, process, direct, indirect, total, elecMWh,
    intensity: p ? total / p : null,
    directInt: p ? direct / p : null,
    indirectInt: p && indirect != null ? indirect / p : null,
  };
}

export const rangeFor = (pid) => GOODS.find((g) => g.productId === pid)?.range || [0.3, 2.2];
export const flatProducts = (h) => (h ? h.factories.flatMap((f) => f.products.map((p) => ({ ...p, factory: f.name, factoryId: f.id }))) : []);
export const productName = (h, pid) => flatProducts(h).find((p) => p.id === pid)?.name || pid;
export const hasAnyData = (data, pid) => QUARTERS.some((q) => data[`${pid}:${q}`]);

const WEIGHT = { error: 12, warning: 8 };

export function detectIssues(data, hierarchy) {
  const issues = [];
  flatProducts(hierarchy).forEach((p) => {
    if (!hasAnyData(data, p.id)) return;
    QUARTERS.forEach((q) => {
      const key = `${p.id}:${q}`;
      const ds = data[key];
      const base = { productId: p.id, q, productName: p.name, weight: 0 };
      if (!ds) {
        issues.push({ ...base, id: `missing:${key}`, type: 'missing_period', severity: 'error', weight: WEIGHT.error, title: `Missing period ${q} 2026`, detail: `No data was found for ${p.name} in ${q}.`, fixLabel: null });
        return;
      }
      if (!ds.production || !ds.elec || !ds.elec.value) {
        issues.push({ ...base, id: `incomplete:${key}`, type: 'incomplete', severity: 'error', weight: WEIGHT.error, title: 'Required fields missing', detail: `${p.name} ${q}: production quantity or electricity use is empty.`, fixLabel: null });
        return;
      }
      let unitIssue = false;
      const mwh = toMWh(ds.elec);
      const perT = mwh / ds.production;
      if (perT > 20 && ds.elec.unit === 'MWh') {
        unitIssue = true;
        issues.push({
          ...base, id: `unit:${key}`, type: 'unit_mismatch', severity: 'error', weight: WEIGHT.error,
          title: 'Unit mismatch: electricity kWh vs MWh',
          detail: `${p.name} ${q}: ${fmt(ds.elec.value)} MWh would be ${fmt(perT)} MWh per tonne, which is implausible. The figure looks like kWh (= ${fmt(ds.elec.value / 1000)} MWh).`,
          fixLabel: `Set unit to kWh (→ ${fmt(ds.elec.value / 1000)} MWh)`,
          fix: (d) => ({ ...d, elec: { ...d.elec, unit: 'kWh' } }),
        });
      } else if (perT < 0.01 && ds.elec.unit === 'kWh') {
        unitIssue = true;
        issues.push({
          ...base, id: `unit:${key}`, type: 'unit_mismatch', severity: 'error', weight: WEIGHT.error,
          title: 'Unit mismatch: electricity kWh vs MWh',
          detail: `${p.name} ${q}: ${fmt(ds.elec.value)} kWh is only ${perT.toFixed(4)} MWh per tonne. The figure looks like MWh.`,
          fixLabel: 'Set unit to MWh',
          fix: (d) => ({ ...d, elec: { ...d.elec, unit: 'MWh' } }),
        });
      }
      if (ds.gridEF == null) {
        issues.push({
          ...base, id: `ef:${key}`, type: 'missing_ef', severity: 'error', weight: WEIGHT.error,
          title: 'Missing grid emission factor',
          detail: `${p.name} ${q}: indirect emissions cannot be calculated without a grid emission factor.`,
          fixLabel: `Apply published national average (${AVG_GRID_EF} tCO₂/MWh)`,
          fix: (d) => ({ ...d, gridEF: AVG_GRID_EF }),
        });
      }
      if (!unitIssue) {
        const c = calc(ds);
        const [lo, hi] = rangeFor(p.id);
        if (c.intensity != null && (c.intensity > hi || c.intensity < lo * 0.5)) {
          const parts = { gasNm3: c.gas, fuelT: c.fuel, processT: c.process, precursorT: (ds.precursorT || 0) * EF.precursor, scrapT: (ds.scrapT || 0) * EF.scrap };
          const top = Object.entries(parts).sort((a, b) => b[1] - a[1])[0][0];
          const scaled = { ...ds, [top]: ds[top] / 10 };
          const ok = calc(scaled).intensity <= hi;
          const labels = { gasNm3: 'natural gas', fuelT: 'fuel', processT: 'process emissions', precursorT: 'precursor', scrapT: 'scrap' };
          issues.push({
            ...base, id: `outlier:${key}`, type: 'outlier', severity: 'warning', weight: WEIGHT.warning,
            title: 'Emissions intensity outside typical range',
            detail: `${p.name} ${q}: ${c.intensity.toFixed(2)} tCO₂e/t vs typical ${lo}–${hi}. Largest driver is ${labels[top]} (${fmt(ds[top])}). This looks like an extra digit.`,
            fixLabel: ok ? `Set ${labels[top]} to ${fmt(ds[top] / 10)}` : null,
            fix: ok ? (d) => ({ ...d, [top]: d[top] / 10 }) : undefined,
          });
        }
      }
    });
  });
  return issues;
}

export const scoreFrom = (issues, data) => (Object.keys(data).length ? Math.max(0, 100 - issues.reduce((s, i) => s + i.weight, 0)) : null);

export function cellStatus(issues, pid, q, data) {
  if (!data[`${pid}:${q}`]) return 'empty';
  const m = issues.filter((i) => i.productId === pid && i.q === q);
  if (m.some((i) => i.severity === 'error')) return 'error';
  return m.length ? 'warning' : 'ok';
}

export function periodHasData(data, q) {
  return Object.keys(data).some((k) => k.endsWith(`:${q}`));
}

// Aggregate across quarters for a product, ignoring blocked ones
export function annualFor(data, issues, pid) {
  let total = 0, prod = 0, direct = 0, indirect = 0, n = 0;
  QUARTERS.forEach((q) => {
    const ds = data[`${pid}:${q}`];
    if (!ds) return;
    if (issues.some((i) => i.productId === pid && i.q === q && i.severity === 'error')) return;
    const c = calc(ds);
    total += c.total; prod += ds.production; direct += c.direct; indirect += c.indirect || 0; n++;
  });
  return { total, prod, direct, indirect, n, intensity: prod ? total / prod : null };
}

// Time/cost model shared by the pain screen and the savings calculator (illustrative)
export function savings(importers, periods = 4, hPer = 7.5, rate = 55) {
  const today = importers * periods * hPer;
  const cmatic = 6 + periods * 2.5 + importers * periods * 0.1;
  return { today, cmatic, savedH: Math.max(0, today - cmatic), savedEur: Math.max(0, today - cmatic) * rate, submissions: importers * periods };
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const delay = (min = 600, max = 1200) => sleep(min + Math.random() * (max - min));
