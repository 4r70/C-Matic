import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Loader2, X, HelpCircle, Sparkles } from 'lucide-react';
import { GLOSSARY } from '../data/seed.js';
import { useStore } from '../store/store.js';

export const cx = (...a) => a.filter(Boolean).join(' ');

export function Logo({ size = 32, light = false, tag = false }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} width={size} height={size} alt="" aria-hidden className="shrink-0 rounded-[24%]" />

      <div className="leading-none">
        <div className={cx('text-[17px] font-semibold tracking-tight', light ? 'text-white' : 'text-ink-900')}>C-Matic</div>
        {tag && <div className="text-[10px] text-ink-500 mt-0.5">See your CBAM data clearly</div>}
      </div>
    </div>
  );
}

const BTN = {
  primary: 'bg-sea-600 text-white hover:bg-sea-700 shadow-sm shadow-sea-600/20 disabled:bg-sea-300',
  secondary: 'bg-white text-ink-900 border border-ink-200 hover:border-sea-300 hover:bg-sea-50 disabled:text-ink-400',
  ghost: 'text-ink-700 hover:bg-ink-100 disabled:text-ink-300',
  soft: 'bg-sea-50 text-sea-700 hover:bg-sea-100 border border-sea-100',
  danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconR, loading, soon, children, className, onClick, disabled, ...rest }) {
  const toast = useStore((s) => s.toast);
  const sizes = { sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg', md: 'text-sm px-3.5 py-2 gap-2 rounded-lg', lg: 'text-[15px] px-5 py-3 gap-2 rounded-xl' };
  const handle = (e) => {
    if (soon) { toast('Coming soon in the full product', 'info'); return; }
    onClick?.(e);
  };
  const btn = (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={handle}
      className={cx('inline-flex items-center justify-center font-medium transition active:scale-[.98] disabled:cursor-not-allowed whitespace-nowrap', BTN[variant], sizes[size], className)}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> : null}
      {children}
      {IconR && !loading && <IconR className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
    </button>
  );
  return soon ? <Tip text="Coming soon">{btn}</Tip> : btn;
}

// Floating layer rendered in document.body so it is never trapped under sibling stacking contexts
function Floating({ anchor, side = 'top', className, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  useLayoutEffect(() => {
    const a = anchor.getBoundingClientRect();
    const w = ref.current?.offsetWidth || 0;
    const h = ref.current?.offsetHeight || 0;
    const left = Math.min(Math.max(8, a.left + a.width / 2 - w / 2), window.innerWidth - w - 8);
    let top = side === 'top' ? a.top - h - 8 : a.bottom + 8;
    if (top < 8) top = a.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, a.top - h - 8);
    setPos({ left, top });
  }, [anchor, side]);
  return createPortal(
    <div ref={ref} className={className} style={{ position: 'fixed', zIndex: 1000, left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}>{children}</div>,
    document.body
  );
}

export function Tip({ text, children, side = 'top' }) {
  const [el, setEl] = useState(null);
  const [open, setOpen] = useState(false);
  return (
    <span ref={setEl} className="inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children}
      {open && el && (
        <Floating anchor={el} side={side} className="pointer-events-none w-max max-w-[240px] rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-normal text-white shadow-lift animate-pop">{text}</Floating>
      )}
    </span>
  );
}

const TONES = {
  slate: 'bg-ink-100 text-ink-700',
  blue: 'bg-sea-50 text-sea-700 ring-1 ring-sea-100',
  sea: 'bg-sea-100 text-sea-800',
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-100',
  violet: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
};
export function Badge({ tone = 'slate', icon: Icon, children, className }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap', TONES[tone], className)}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

export const Illustrative = ({ className }) => (
  <Tip text="All emission values in this prototype are illustrative, not real calculations.">
    <Badge tone="violet" icon={Sparkles} className={className}>illustrative</Badge>
  </Tip>
);

export function Card({ className, children, ...rest }) {
  return <div {...rest} className={cx('card', className)}>{children}</div>;
}

export function PageHeader({ eyebrow, title, desc, actions }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6 animate-rise">
      <div className="max-w-2xl">
        {eyebrow && <div className="text-xs font-semibold uppercase tracking-wider text-sea-600 mb-1.5">{eyebrow}</div>}
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-ink-900">{title}</h1>
        {desc && <p className="text-ink-500 mt-1.5 text-[15px] leading-relaxed">{desc}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide, footer }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px] animate-pop" onClick={onClose} />
      <div className={cx('relative bg-white rounded-2xl shadow-lift w-full max-h-[90vh] flex flex-col animate-pop', wide ? 'max-w-3xl' : 'max-w-lg')}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 pb-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-ink-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export const Spinner = ({ className }) => <Loader2 className={cx('w-4 h-4 animate-spin', className)} />;
export const Skeleton = ({ className }) => <div className={cx('skeleton', className)} />;

export function Progress({ value, tone = 'sea', className, h = 'h-2' }) {
  const c = { sea: 'bg-sea-500', green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500' }[tone];
  return (
    <div className={cx('w-full rounded-full bg-ink-100 overflow-hidden', h, className)}>
      <div className={cx('h-full rounded-full transition-all duration-700 ease-out', c)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Ring({ value, size = 120, stroke = 10, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = value >= 100 ? '#10b981' : value >= 80 ? '#2f7cf6' : value >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eaeff6" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.4,0,.2,1), stroke .5s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-semibold num leading-none">{value == null ? '—' : `${value}%`}</div>
        {label && <div className="text-[11px] text-ink-500 mt-1">{label}</div>}
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <Card className="p-12 text-center animate-rise">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-sea-50 text-sea-600 flex items-center justify-center mb-4">{Icon && <Icon className="w-6 h-6" />}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-ink-500 mt-1 max-w-md mx-auto">{text}</p>
      {action && <div className="mt-5 flex justify-center gap-2">{action}</div>}
    </Card>
  );
}

export function Help({ k, className }) {
  const g = GLOSSARY[k];
  const [open, setOpen] = useState(false);
  const [el, setEl] = useState(null);
  if (!g) return null;
  return (
    <span ref={setEl} className={cx('inline-flex', className)} onMouseLeave={() => setOpen(false)}>
      <button type="button" onMouseEnter={() => setOpen(true)} onClick={() => setOpen((o) => !o)} className="text-ink-400 hover:text-sea-600 transition" aria-label={`What is ${g.term}?`}>
        <HelpCircle className="w-4 h-4" />
      </button>
      {open && el && (
        <Floating anchor={el} side="bottom" className="w-64 rounded-xl bg-white border border-ink-200 shadow-lift p-3 text-left animate-pop">
          <span className="block text-xs font-semibold text-sea-700 mb-1">{g.term}</span>
          <span className="block text-xs leading-relaxed text-ink-700 font-normal">{g.text}</span>
        </Floating>
      )}
    </span>
  );
}

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)}
      className={cx('relative inline-flex h-5 w-9 items-center rounded-full transition', checked ? 'bg-sea-600' : 'bg-ink-200', disabled && 'opacity-50 cursor-not-allowed')}
    >
      <span className={cx('inline-block h-4 w-4 rounded-full bg-white shadow transition', checked ? 'translate-x-[18px]' : 'translate-x-0.5')} />
    </button>
  );
}

export function Check2({ checked, onChange, disabled, children }) {
  return (
    <label className={cx('flex items-center gap-2.5 text-sm select-none', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}>
      <span
        onClick={(e) => { e.preventDefault(); if (!disabled) onChange(!checked); }}
        className={cx('w-[18px] h-[18px] rounded-md border flex items-center justify-center transition shrink-0', checked ? 'bg-sea-600 border-sea-600' : 'bg-white border-ink-300')}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      {children}
    </label>
  );
}

export function Field({ label, help, children, hint, className }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="label">{label}</span>
        {help && <Help k={help} />}
      </div>
      {children}
      {hint && <div className="text-[11px] text-ink-400 mt-1">{hint}</div>}
    </div>
  );
}

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cx('inline-flex p-1 rounded-xl bg-ink-100 gap-0.5', className)}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className={cx('px-3 py-1.5 text-sm rounded-lg font-medium transition flex items-center gap-1.5', value === t.id ? 'bg-white shadow-soft text-ink-900' : 'text-ink-500 hover:text-ink-900')}>
          {t.icon && <t.icon className="w-3.5 h-3.5" />}{t.label}
        </button>
      ))}
    </div>
  );
}

export function StepRunner({ title, steps, onDone, subtitle }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= steps.length) { const t = setTimeout(onDone, 350); return () => clearTimeout(t); }
    const t = setTimeout(() => setI((x) => x + 1), 650 + (i * 137) % 400);
    return () => clearTimeout(t);
  }, [i]);
  return (
    <Card className="p-6 max-w-md mx-auto animate-pop">
      <h3 className="font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
      <div className="mt-4 space-y-2.5">
        {steps.map((s, idx) => (
          <div key={s} className={cx('flex items-center gap-3 text-sm transition', idx > i ? 'text-ink-300' : 'text-ink-900')}>
            <span className="w-5 h-5 flex items-center justify-center">
              {idx < i ? <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} /> : idx === i ? <Spinner className="text-sea-600" /> : <span className="w-1.5 h-1.5 rounded-full bg-ink-200" />}
            </span>
            {s}
          </div>
        ))}
      </div>
      <Progress className="mt-5" value={(Math.min(i, steps.length) / steps.length) * 100} />
    </Card>
  );
}

export function ToastHost() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={cx('animate-pop flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm shadow-lift text-white', t.tone === 'info' ? 'bg-ink-900' : t.tone === 'err' ? 'bg-red-600' : 'bg-emerald-600')}>
          {t.tone === 'info' ? <Sparkles className="w-4 h-4" /> : <Check className="w-4 h-4" strokeWidth={3} />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export function CountUp({ value, d = 0, prefix = '', suffix = '', ms = 800 }) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const from = v; const t0 = performance.now(); let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(from + (value - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{prefix}{v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })}{suffix}</>;
}
