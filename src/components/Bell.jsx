import React from 'react';
import { Bell, Scale, Activity } from 'lucide-react';
import { useStore } from '../store/store.js';
import { REG_FEED } from '../data/seed.js';
import { cx, Badge } from './ui.jsx';

export default function BellMenu() {
  const { notifications, bellOpen, toggleBell, role, readReg, markAllRead, go } = useStore();
  const mine = notifications.filter((n) => n.audience === role);
  const unread = mine.filter((n) => n.unread).length + REG_FEED.filter((r) => !readReg.includes(r.id)).length;
  return (
    <div className="relative no-print">
      <button onClick={() => { toggleBell(); }} className={cx('relative p-2 rounded-lg transition', bellOpen ? 'bg-ink-100' : 'text-ink-500 hover:bg-ink-100')} aria-label="Notifications">
        <Bell className="w-[18px] h-[18px]" />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-sea-600 text-white text-[10px] font-semibold flex items-center justify-center">{unread}</span>}
      </button>
      {bellOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => toggleBell(false)} />
          <div className="absolute right-0 top-full mt-2 w-[360px] z-50 card shadow-lift animate-pop overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
              <div className="font-semibold text-sm">Notifications</div>
              <button className="text-xs text-sea-600 font-medium" onClick={markAllRead}>Mark activity read</button>
            </div>
            <div className="max-h-[360px] overflow-y-auto divide-y divide-ink-100">
              {mine.map((n) => (
                <div key={n.id} className={cx('px-4 py-3 flex gap-3 text-sm', n.unread && 'bg-sea-50/50')}>
                  <Activity className="w-4 h-4 text-sea-600 mt-0.5 shrink-0" />
                  <div><div className="text-ink-900">{n.text}</div><div className="text-[11px] text-ink-400 mt-0.5">{n.at}</div></div>
                </div>
              ))}
              {REG_FEED.slice(0, 3).map((r) => (
                <button key={r.id} onClick={() => { go('regulation'); }} className="w-full text-left px-4 py-3 flex gap-3 text-sm hover:bg-ink-50">
                  <Scale className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                  <div><div className="text-ink-900">{r.title}</div><div className="mt-1 flex gap-1.5"><Badge tone="violet">{r.tag}</Badge><span className="text-[11px] text-ink-400">{r.date}</span></div></div>
                </button>
              ))}
            </div>
            <button onClick={() => go('regulation')} className="w-full py-2.5 text-sm font-medium text-sea-700 border-t border-ink-100 hover:bg-sea-50">Open regulation tracker</button>
          </div>
        </>
      )}
    </div>
  );
}
