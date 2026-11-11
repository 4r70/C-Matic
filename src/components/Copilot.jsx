import React, { useEffect, useRef, useState } from 'react';
import { Send, X, Sparkles } from 'lucide-react';
import { useStore } from '../store/store.js';
import { COPILOT } from '../data/seed.js';
import { detectIssues, scoreFrom } from '../lib/calc.js';
import { cx, Illustrative } from './ui.jsx';

function answerFor(text) {
  const t = text.toLowerCase();
  const hit = COPILOT.find((c) => c.k.some((k) => t.includes(k)));
  if (!hit) return 'I am a canned-answer copilot in this prototype. Try one of the suggested questions: direct vs indirect emissions, grid factors, default values, precursors, CN codes or your quality score.';
  if (hit.a === '__score__') {
    const s = useStore.getState();
    if (!s.imported) return 'You have not imported data yet, so there is no score. Import the sample spreadsheet and I will explain every deduction.';
    const issues = detectIssues(s.data, s.hierarchy);
    const score = scoreFrom(issues, s.data);
    if (!issues.length) return 'Your score is 100%: every completeness and plausibility check passes, so the dataset is ready to share.';
    return `Your score is ${score}%. ${issues.length} open issue${issues.length > 1 ? 's' : ''}: ${issues.map((i) => `${i.title} (${i.productName} ${i.q})`).join('; ')}. Open Validation and use the one-click fixes to reach 100%.`;
  }
  return hit.a;
}

export default function Copilot() {
  const open = useStore((s) => s.copilotOpen);
  const close = () => useStore.getState().toggleCopilot(false);
  const tourOpen = useStore((s) => s.tourOpen);
  const [msgs, setMsgs] = useState([{ from: 'bot', text: 'Hi, I am the C-Matic copilot. Ask me about CBAM terms, your data or how sharing works. (Prototype: canned answers.)' }]);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  const ask = (q) => {
    if (!q.trim() || busy) return;
    setMsgs((m) => [...m, { from: 'me', text: q }]);
    setVal(''); setBusy(true);
    const a = answerFor(q);
    setTimeout(() => { setMsgs((m) => [...m, { from: 'bot', text: a }]); setBusy(false); }, 700 + Math.random() * 500);
  };
  if (!open) return null;
  return (
    <aside className={cx('fixed right-0 top-14 w-full sm:w-[380px] bg-white border-l border-ink-200 shadow-lift z-30 flex flex-col animate-pop no-print', tourOpen ? 'bottom-[120px]' : 'bottom-0')}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
        <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-sea-600 text-white flex items-center justify-center"><Sparkles className="w-4 h-4" /></span><div className="font-semibold text-sm">CBAM copilot</div><Illustrative /></div>
        <button onClick={close} className="p-1.5 rounded-lg hover:bg-ink-100"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={cx('max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed animate-rise', m.from === 'me' ? 'ml-auto bg-sea-600 text-white rounded-br-md' : 'bg-ink-100 text-ink-900 rounded-bl-md')}>{m.text}</div>
        ))}
        {busy && <div className="bg-ink-100 rounded-2xl rounded-bl-md px-4 py-3 w-16 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />)}</div>}
        <div ref={endRef} />
      </div>
      <div className="px-4 pt-2 flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
        {COPILOT.slice(0, 5).map((c) => (
          <button key={c.q} onClick={() => ask(c.q)} className="text-xs px-2.5 py-1.5 rounded-full bg-sea-50 text-sea-700 hover:bg-sea-100 text-left">{c.q}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); ask(val); }} className="p-3 flex gap-2">
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Ask about CBAM…" className="input" />
        <button className="px-3 rounded-lg bg-sea-600 text-white hover:bg-sea-700" aria-label="Send"><Send className="w-4 h-4" /></button>
      </form>
    </aside>
  );
}
