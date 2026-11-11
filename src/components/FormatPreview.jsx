import React from 'react';
import { Mail, Paperclip, ShieldCheck, Lock, FileSpreadsheet } from 'lucide-react';
import { PRODUCER, YEAR } from '../data/seed.js';
import { prettyKey, toJSON, toCSV, htmlDoc } from '../lib/outputs.js';
import { fmt } from '../lib/calc.js';
import { cx } from './ui.jsx';

export function exportFile(importer, rows, version = 1) {
  const base = `anadolu_celik_cbam_${YEAR}`;
  if (importer.outFormat === 'api') return { name: `${base}_v${version}.json`, mime: 'application/json', content: toJSON(rows, importer, version) };
  if (importer.outFormat === 'email') return { name: `${base}_v${version}.csv`, mime: 'text/csv', content: toCSV(rows) };
  if (importer.outFormat === 'pdf') return { name: `${base}_declaration_v${version}.html`, mime: 'text/html', content: htmlDoc(rows, `${importer.name}: supplier CBAM declaration`) };
  return { name: `${base}_baltic_template_v${version}.xls`, mime: 'application/vnd.ms-excel', content: htmlDoc(rows, `${importer.name}: CBAM supplier template v3`) };
}

const cols = (rows) => [...new Set(rows.flatMap((r) => Object.keys(r)))];
const cell = (v) => (v == null ? '' : typeof v === 'number' ? fmt(v, v % 1 ? 3 : 0) : String(v));

function Excel({ importer, rows }) {
  const cs = cols(rows);
  const L = (i) => String.fromCharCode(65 + i);
  return (
    <div className="rounded-xl overflow-hidden border border-ink-200 bg-white paper-shadow">
      <div className="bg-emerald-700 text-white px-3 py-2 flex items-center gap-2 text-xs"><FileSpreadsheet className="w-4 h-4" /> baltic_supplier_template_v3.xlsx <span className="opacity-70">· auto-filled by C-Matic</span></div>
      <div className="px-3 py-2 text-[13px] font-semibold border-b border-ink-200 bg-ink-50">{importer.name} · CBAM supplier template v3 · Reporting year {YEAR}</div>
      <div className="overflow-x-auto">
        <table className="text-[12px] border-collapse w-full min-w-max">
          <thead>
            <tr className="bg-ink-100 text-ink-500"><th className="w-8 border border-ink-200" />{cs.map((c, i) => <th key={c} className="border border-ink-200 px-2 py-0.5 font-normal">{L(i)}</th>)}</tr>
            <tr className="bg-emerald-50"><th className="border border-ink-200 text-ink-500 font-normal">1</th>{cs.map((c) => <th key={c} className="border border-ink-200 px-2 py-1.5 text-left font-semibold whitespace-nowrap">{prettyKey(c)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-sea-50/50">
                <td className="border border-ink-200 bg-ink-100 text-center text-ink-500">{i + 2}</td>
                {cs.map((c) => <td key={c} className={cx('border border-ink-200 px-2 py-1 whitespace-nowrap num', typeof r[c] === 'number' && 'text-right')}>{cell(r[c])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-0.5 bg-ink-100 px-2 pt-1 text-[11px] border-t border-ink-200"><span className="bg-white px-3 py-1 rounded-t border border-b-0 border-ink-200 font-medium">Supplier data</span><span className="px-3 py-1 text-ink-500">Instructions</span><span className="px-3 py-1 text-ink-500">Lists</span></div>
    </div>
  );
}

function Pdf({ importer, rows, version }) {
  const cs = cols(rows).filter((c) => !['cn_code'].includes(c));
  return (
    <div className="bg-ink-200/60 rounded-xl p-5 overflow-x-auto">
      <div className="bg-white mx-auto max-w-[760px] paper-shadow p-8 relative min-w-[560px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="text-6xl font-bold text-ink-100 -rotate-12 select-none">ILLUSTRATIVE</div></div>
        <div className="relative">
          <div className="flex justify-between items-start border-b-2 border-ink-900 pb-3">
            <div><div className="text-lg font-bold">{importer.name}</div><div className="text-xs text-ink-500">Supplier CBAM Declaration · Reporting year {YEAR}</div></div>
            <div className="text-right text-xs text-ink-500">Dataset v{version}<br />Form RB-CBAM-04</div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs mt-4">
            <div><div className="font-semibold">1. Producer</div>{PRODUCER.company}<br />{PRODUCER.city}, {PRODUCER.country}</div>
            <div><div className="font-semibold">2. Recipient</div>{importer.name}<br />{importer.city}</div>
          </div>
          <div className="text-xs font-semibold mt-5 mb-1.5">3. Production and embedded emissions</div>
          <table className="w-full text-[11px] border-collapse">
            <thead><tr>{['product', 'period', ...cs.filter((c) => !['product', 'period'].includes(c))].map((c) => <th key={c} className="border border-ink-300 bg-ink-100 px-1.5 py-1 text-left">{prettyKey(c)}</th>)}</tr></thead>
            <tbody>{rows.map((r, i) => <tr key={i}>{['product', 'period', ...cs.filter((c) => !['product', 'period'].includes(c))].map((c) => <td key={c} className="border border-ink-300 px-1.5 py-1 num">{cell(r[c])}</td>)}</tr>)}</tbody>
          </table>
          <div className="mt-6 flex items-end justify-between text-xs">
            <div className="flex items-center gap-2 text-sea-700"><ShieldCheck className="w-5 h-5" /> <div><div className="font-semibold">Digitally sealed by C-Matic</div><div className="text-ink-500 font-mono">sha256 a41f9c…e07b2</div></div></div>
            <div className="text-ink-400">Page 1 / 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Json({ importer, rows, version }) {
  const json = toJSON(rows, importer, version)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/"([^"]+)":/g, '<span class="text-sky-300">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="text-emerald-300">"$1"</span>')
    .replace(/: (-?\d[\d.]*)/g, ': <span class="text-amber-300">$1</span>');
  return (
    <div className="rounded-xl overflow-hidden bg-[#0b1b33] text-white paper-shadow">
      <div className="px-4 py-2.5 border-b border-white/10 text-xs font-mono flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">POST</span>
        <span className="text-ink-300">https://api.deltametals.example/v2/cbam/suppliers/anadolu/datasets</span>
        <span className="ml-auto text-emerald-300">200 OK · 312 ms</span>
      </div>
      <div className="px-4 py-1.5 text-[11px] font-mono text-ink-400 border-b border-white/10 flex items-center gap-1.5"><Lock className="w-3 h-3" /> X-CMatic-Signature: hmac-sha256=9be1…44c2</div>
      <pre className="p-4 text-[12px] leading-relaxed font-mono overflow-auto max-h-[460px]" dangerouslySetInnerHTML={{ __html: json }} />
    </div>
  );
}

function EmailPrev({ importer, rows, version }) {
  const cs = cols(rows).filter((c) => !['cn_code'].includes(c)).slice(0, 5);
  return (
    <div className="rounded-xl bg-white border border-ink-200 paper-shadow overflow-hidden">
      <div className="px-5 py-4 border-b border-ink-100 text-sm space-y-1">
        <div className="flex items-center gap-2 font-semibold"><Mail className="w-4 h-4 text-sea-600" /> CBAM data {YEAR} · Anadolu Çelik · v{version}</div>
        <div className="text-ink-500 text-xs">From: <b className="text-ink-700">C-Matic on behalf of Anadolu Çelik</b> &lt;no-reply@c-matic.example&gt;</div>
        <div className="text-ink-500 text-xs">To: <b className="text-ink-700">{importer.contact}</b> ({importer.name})</div>
      </div>
      <div className="px-5 py-4 text-sm leading-relaxed">
        <p>Bonjour {importer.contact.split(' ')[0]},</p>
        <p className="mt-2">Please find the latest embedded-emissions data from Anadolu Çelik Sanayi A.Ş. The full structured file is attached. Values are illustrative.</p>
        <table className="mt-3 text-xs border-collapse w-full">
          <thead><tr>{cs.map((c) => <th key={c} className="border border-ink-200 bg-ink-50 px-2 py-1 text-left">{prettyKey(c)}</th>)}</tr></thead>
          <tbody>{rows.slice(0, 8).map((r, i) => <tr key={i}>{cs.map((c) => <td key={c} className="border border-ink-200 px-2 py-1 num">{cell(r[c])}</td>)}</tr>)}</tbody>
        </table>
        {rows.length > 8 && <p className="text-xs text-ink-400 mt-1">… {rows.length - 8} more rows in the attachment</p>}
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-xs bg-ink-50"><Paperclip className="w-3.5 h-3.5" /> anadolu_cbam_{YEAR}_v{version}.csv <span className="text-ink-400">· {Math.max(2, Math.round(rows.length * 0.4))} KB</span></div>
        <p className="mt-4 text-xs text-ink-400">Sent via C-Matic: this message is generated from the producer’s shared dataset. Revoke access at any time.</p>
      </div>
    </div>
  );
}

export default function FormatPreview({ importer, rows, version = 1 }) {
  if (!rows.length) return <div className="rounded-xl border border-dashed border-ink-300 p-10 text-center text-ink-500 text-sm">Nothing to preview. No product or period is shared with this importer yet.</div>;
  const P = { excel: Excel, pdf: Pdf, api: Json, email: EmailPrev }[importer.outFormat] || Excel;
  return <P importer={importer} rows={rows} version={version} />;
}
