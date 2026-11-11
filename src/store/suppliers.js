import { useMemo } from 'react';
import { useStore } from './store.js';
import { useDerived } from './derived.js';
import { buildSuppliers, FLOWS, PRODUCER, CARBON_PRICE, GOODS } from '../data/seed.js';
import { annualFor } from '../lib/calc.js';

export function exposure(s) {
  const hasData = s.status === 'data_shared' || s.status === 'verified';
  const atDefault = s.annualT * s.def * CARBON_PRICE;
  const actual = hasData && s.actual != null ? s.annualT * s.actual * CARBON_PRICE : null;
  return { hasData, atDefault, actual, avoided: actual != null ? atDefault - actual : 0 };
}

export function useSuppliers() {
  const importerId = useStore((s) => s.importerId);
  const invite = useStore((s) => s.invite);
  const invitePayload = useStore((s) => s.invitePayload);
  const connections = useStore((s) => s.connections);
  const onboarded = useStore((s) => s.onboarded);
  const imported = useStore((s) => s.imported);
  const data = useStore((s) => s.data);
  const { issues, score } = useDerived();
  return useMemo(() => {
    const list = buildSuppliers(importerId);
    const flow = FLOWS[importerId];
    const conn = connections[importerId];
    let status = 'not_invited';
    if (conn) status = 'data_shared';
    else if (importerId === (invitePayload?.importerId || 'baltic')) status = invite === 'sent' ? 'invited' : invite === 'accepted' ? 'onboarding' : 'not_invited';
    else if (invite === 'accepted') status = 'not_invited';
    const completeness = conn ? 100 : status === 'onboarding' ? (imported ? Math.max(40, score ?? 0) * 0.9 | 0 : onboarded ? 35 : 15) : status === 'invited' ? 5 : 0;
    const prodId = flow.product;
    const actual = conn ? annualFor(data, issues, prodId).intensity : null;
    const anadolu = {
      id: 'anadolu', name: PRODUCER.company, country: 'Türkiye', cn: GOODS.find((g) => g.productId === prodId).cn, status, annualT: flow.t,
      completeness, actual, def: flow.def, email: PRODUCER.email, lastUpdate: conn ? conn.updated : status === 'not_invited' ? '—' : 'today', isDemo: true,
    };
    return [anadolu, ...list];
  }, [importerId, invite, invitePayload, connections, onboarded, imported, data, issues, score]);
}
