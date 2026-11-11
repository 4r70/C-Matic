import React, { useState } from 'react';
import { Mail, ShieldCheck, Lock, Eye, ArrowRight, Building2, CheckCircle2, Factory } from 'lucide-react';
import { useStore } from '../store/store.js';
import { importerById, PRODUCER } from '../data/seed.js';
import { delay } from '../lib/calc.js';
import { Button, Card, Badge, Empty, Logo } from '../components/ui.jsx';

export default function Invitation() {
  const { invite, invitePayload, acceptInvite, go, setRole, toast } = useStore();
  const [busy, setBusy] = useState(false);
  const imp = importerById(invitePayload?.importerId || 'baltic');

  if (invite === 'none') {
    return (
      <Empty icon={Mail} title="No invitations yet" text="In C-Matic, importers invite their suppliers. Switch to the importer side, send an invite to Anadolu Çelik, and it lands here."
        action={<><Button onClick={() => setRole('importer')} iconRight={ArrowRight}>Go to importer view</Button><Button variant="secondary" onClick={() => go('onboarding')}>Skip to onboarding</Button></>} />
    );
  }
  const accept = async () => { setBusy(true); await delay(900, 1200); acceptInvite(); setBusy(false); toast('Invitation accepted. Welcome to C-Matic!'); };

  if (invite === 'accepted') {
    return (
      <Card className="max-w-xl mx-auto p-10 text-center animate-pop">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 className="w-9 h-9" /></div>
        <h2 className="text-2xl font-semibold mt-4">You are connected to {imp.short}</h2>
        <p className="text-ink-500 mt-2">Your account is ready. Next, tell us about your company and factories. It takes about two minutes.</p>
        <Button size="lg" className="mt-6" iconRight={ArrowRight} onClick={() => go('onboarding')}>Start onboarding</Button>
      </Card>
    );
  }
  return (
    <div className="max-w-2xl mx-auto animate-rise">
      <div className="text-center mb-5 text-xs text-ink-500 flex items-center justify-center gap-1.5"><Mail className="w-3.5 h-3.5" /> You opened the link in your e-mail from {imp.contact}</div>
      <Card className="overflow-hidden shadow-lift">
        <div className="bg-gradient-to-br from-sea-700 to-sea-950 text-white p-8 relative overflow-hidden">
          <svg className="absolute -right-10 -bottom-6 opacity-20" width="320" height="140" viewBox="0 0 320 140"><path d="M0 70 Q40 20 80 70 T160 70 T240 70 T320 70" fill="none" stroke="#fff" strokeWidth="3" /><path d="M0 100 Q40 50 80 100 T160 100 T240 100 T320 100" fill="none" stroke="#fff" strokeWidth="2" /></svg>
          <Logo light />
          <div className="mt-8 text-sm text-sea-200">You have been invited</div>
          <h2 className="text-2xl md:text-3xl font-semibold mt-1">Invited by {imp.name}, {imp.city}</h2>
          <p className="text-sea-100 mt-2 max-w-md">{invitePayload?.message}</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 rounded-xl bg-ink-50 p-4">
            <div className="w-11 h-11 rounded-xl bg-sea-100 text-sea-700 flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
            <div className="text-sm flex-1"><div className="font-semibold">{imp.name}</div><div className="text-ink-500">{imp.city} · requesting data for 2026</div></div>
            <div className="flex gap-1.5"><Badge tone="blue">CN 7318</Badge><Badge tone="blue">CN 7213</Badge></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            {[[Lock, 'Nothing is shared by default', 'You decide what each importer sees.'], [Eye, 'Enter your data once', 'Reuse it for every other importer.'], [ShieldCheck, 'Trust layer', 'Every connection is signed and logged.']].map(([I, t, d]) => (
              <div key={t}><I className="w-5 h-5 text-sea-600 mb-2" /><div className="font-medium">{t}</div><div className="text-ink-500 text-[13px]">{d}</div></div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Factory className="w-4 h-4 text-ink-400" /><span className="text-sm text-ink-500 flex-1">Creating account for <b className="text-ink-900">{PRODUCER.company}</b> ({PRODUCER.contact}). No password needed in the demo.</span>
          </div>
          <div className="flex gap-3">
            <Button size="lg" className="flex-1" loading={busy} data-tour="accept-btn" onClick={accept}>{busy ? 'Setting up your workspace…' : 'Accept and continue'}</Button>
            <Button size="lg" variant="secondary" onClick={() => toast('You can accept any time. The link stays valid for 30 days.', 'info')}>Not now</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
