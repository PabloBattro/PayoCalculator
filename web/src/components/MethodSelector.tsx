'use client';

import { motion } from 'framer-motion';

type Method = 'bank_transfer' | 'p2p' | 'card';

interface Props {
  value: Method;
  onChange: (method: Method) => void;
}

const methods: { id: Method; label: string; icon: React.ReactNode; enabled: boolean }[] = [
  {
    id: 'bank_transfer',
    label: 'Bank transfer',
    enabled: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 7l7-4.5L16 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 7v6M8 7v6M10 7v6M14 7v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M2 13h14M3 15h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'p2p',
    label: 'Payoneer to Payoneer',
    enabled: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="6.5" cy="7" r="3" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="11.5" cy="7" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 15c0-2.2 1.8-4 4-4h1M16 15c0-2.2-1.8-4-4-4h-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'card',
    label: 'Card payment',
    enabled: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 8h14" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function MethodSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {methods.map((m) => (
        <button
          key={m.id}
          onClick={() => m.enabled && onChange(m.id)}
          disabled={!m.enabled}
          className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all cursor-pointer ${
            m.id === value
              ? 'bg-brand-coral/10 text-brand-coral border border-brand-coral/20'
              : m.enabled
              ? 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              : 'bg-gray-50/50 text-gray-300 border border-gray-100 cursor-not-allowed'
          }`}
          type="button"
        >
          {m.id === value && (
            <motion.div
              layoutId="method-bg"
              className="absolute inset-0 rounded-xl bg-brand-coral/10 border border-brand-coral/20"
              transition={{ duration: 0.2 }}
            />
          )}
          <span className="relative z-10">{m.icon}</span>
          <span className="relative z-10 hidden sm:inline">{m.label}</span>
          {!m.enabled && (
            <span className="relative z-10 hidden sm:inline text-[10px] text-gray-300 font-normal">
              Soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

