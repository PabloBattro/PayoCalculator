'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { currencies } from '@/config/currencies';
import type { QuoteResponse, CurrencyConfig } from '@/types/quote';
import CurrencyDropdown from './CurrencyDropdown';
import MethodSelector from './MethodSelector';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(value: number, currency: CurrencyConfig): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });
}

function getCurrencyByCode(code: string): CurrencyConfig {
  return currencies.find((c) => c.code === code)!;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AmountInput({
  value,
  onChange,
  symbol,
}: {
  value: string;
  onChange: (val: string) => void;
  symbol: string;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      <span className="text-lg text-gray-400 font-medium select-none">{symbol}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9.]/g, '');
          if (v.split('.').length > 2) return;
          onChange(v);
        }}
        placeholder="0.00"
        className="w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300"
      />
    </div>
  );
}

/** Rate freshness timestamp — matches internal FX widget's "Last updated: 12:30 PM" */
function RateTimestamp({ iso }: { iso: string }) {
  const date = new Date(iso);
  const now = Date.now();
  const diffMin = Math.round((now - date.getTime()) / 60_000);

  let label: string;
  if (diffMin < 1) {
    label = 'just now';
  } else if (diffMin < 60) {
    label = `${diffMin} min ago`;
  } else {
    // Show absolute time: "12:30 PM"
    label = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-1">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
        <path d="M5 3v2.5l1.5 1" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Rate updated {label}
    </div>
  );
}

/** Skeleton for loading state — friendly copy below bars, like the internal FX widget */
function QuoteSkeleton() {
  return (
    <div className="px-5 py-3 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-4 w-28 rounded bg-gray-200" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-4 w-36 rounded bg-gray-200" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
      <p className="text-xs text-gray-400 text-center pt-1">Calculating your quote...</p>
    </div>
  );
}

/** Animated volume discount banner — Wise-style slide-in */
function VolumeHintBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="flex items-center gap-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-xl px-3.5 py-2.5">
        <span className="text-emerald-600 shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 8l1.5 1.5L10 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-xs text-emerald-800 font-medium leading-snug">{message}</span>
      </div>
    </motion.div>
  );
}

/** Subtle stale-rate indicator */
function StaleRateIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-1.5 text-[10px] text-amber-600 px-5 pb-1"
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
      Exchange rates may be delayed
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Fee breakdown for non-local (cross-currency) transfers
// ---------------------------------------------------------------------------

function FxBreakdown({
  quote,
  showFees,
  setShowFees,
  sendCfg,
  sendCurrency,
}: {
  quote: QuoteResponse;
  showFees: boolean;
  setShowFees: (v: boolean) => void;
  sendCfg: CurrencyConfig;
  sendCurrency: string;
}) {
  return (
    <div className="px-5 py-3.5 space-y-2.5 text-sm">
      {/* Fee row */}
      <button
        onClick={() => setShowFees(!showFees)}
        className="flex w-full items-center justify-between text-gray-600 hover:text-gray-900 transition-colors"
        type="button"
      >
        <span className="flex items-center gap-2">
          <span className="w-4 text-center text-gray-400 font-light">−</span>
          <span className="font-medium">
            {sendCfg.symbol}
            {fmt(quote.fee, sendCfg)}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-gray-500">
          <span className="text-xs">{quote.feeLabel}</span>
          <motion.svg
            animate={{ rotate: showFees ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </span>
      </button>

      {/* Expandable fee details */}
      <AnimatePresence>
        {showFees && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="ml-6 pl-3 border-l-2 border-gray-200 text-xs text-gray-500 space-y-1.5 pb-1">
              <div className="flex justify-between">
                <span>Transfer fee</span>
                <span className="font-mono">
                  {sendCfg.symbol}
                  {fmt(quote.fee, sendCfg)} {sendCurrency}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amount to convert */}
      <div className="flex items-center justify-between text-gray-600">
        <span className="flex items-center gap-2">
          <span className="w-4 text-center text-gray-400 font-light">=</span>
          <span className="font-medium">
            {sendCfg.symbol}
            {fmt(quote.amountToConvert, sendCfg)}
          </span>
        </span>
        <span className="text-xs text-gray-500">Amount you&apos;ll convert</span>
      </div>

      {/* Exchange rate */}
      <div className="flex items-center justify-between text-gray-600">
        <span className="flex items-center gap-2">
          <span className="w-4 text-center text-gray-400 font-light">×</span>
          <span className="font-medium font-mono">
            {quote.exchangeRate.toFixed(4)}
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          Exchange rate
          {/* Tap-area wrapper (invisible p-2 adds ~44px touch target for mobile) */}
          <span
            className="relative p-2 -m-2 cursor-help"
            title="Our exchange fees help cover the cost of exchanging uncommon currencies and the uncertainty of making exchanges while the market is closed. You can find out more in our fees page"
          >
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[11px] font-bold text-gray-500"
            >
              ?
            </span>
          </span>
        </span>
      </div>

      {/* Rate freshness — matches internal FX widget's "Last updated: 12:30 PM" */}
      {quote.rateUpdatedAt && (
        <RateTimestamp iso={quote.rateUpdatedAt} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fee breakdown for local (same-currency) transfers — simplified
// ---------------------------------------------------------------------------

function LocalBreakdown({
  quote,
  sendCfg,
}: {
  quote: QuoteResponse;
  sendCfg: CurrencyConfig;
}) {
  return (
    <div className="px-5 py-3.5 text-sm">
      <div className="flex items-center justify-between text-gray-600">
        <span className="flex items-center gap-2">
          <span className="w-4 text-center text-gray-400 font-light">−</span>
          <span className="font-medium">
            {quote.fee > 0
              ? `${sendCfg.symbol}${fmt(quote.fee, sendCfg)}`
              : 'Free'}
          </span>
        </span>
        <span className="text-xs text-gray-500">{quote.feeLabel}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Widget
// ---------------------------------------------------------------------------

export default function QuoteWidget() {
  const [direction, setDirection] = useState<'send' | 'receive'>('send');
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('BRL');
  const [sendInput, setSendInput] = useState('1000');
  const [receiveInput, setReceiveInput] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFees, setShowFees] = useState(false);
  const [method, setMethod] = useState<'bank_transfer' | 'p2p' | 'card'>('bank_transfer');
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Strip thousand separators before parsing (inputs may contain commas after formatting)
  const amount = direction === 'send'
    ? parseFloat(sendInput.replace(/,/g, ''))
    : parseFloat(receiveInput.replace(/,/g, ''));

  const fetchQuote = useCallback(async () => {
    if (!amount || amount <= 0) {
      setQuote(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sendCurrency,
          receiveCurrency,
          amount,
          direction,
          method: 'bank_transfer',
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data: QuoteResponse = await res.json();
      setQuote(data);

      // Format BOTH inputs with thousand separators from the API response.
      // The active (user-typed) field also gets formatted once the debounce fires,
      // ensuring consistent display (e.g. "109809" → "109,809").
      const sendCfg = getCurrencyByCode(data.sendCurrency);
      const recvCfg = getCurrencyByCode(data.receiveCurrency);
      setSendInput(fmt(data.sendAmount, sendCfg));
      setReceiveInput(fmt(data.receiveAmount, recvCfg));
    } catch {
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [amount, sendCurrency, receiveCurrency, direction]);

  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(fetchQuote, 350);
    return () => clearTimeout(debounce.current);
  }, [fetchQuote]);

  const handleSwap = () => {
    setSendCurrency(receiveCurrency);
    setReceiveCurrency(sendCurrency);
    if (direction === 'send') {
      setDirection('receive');
      setReceiveInput(sendInput);
      setSendInput('');
    } else {
      setDirection('send');
      setSendInput(receiveInput);
      setReceiveInput('');
    }
  };

  const sendCfg = getCurrencyByCode(sendCurrency);
  const recvCfg = getCurrencyByCode(receiveCurrency);

  return (
    <div className="w-full max-w-[440px]">
      {/* Method Selector */}
      <div className="mb-3">
        <MethodSelector value={method} onChange={setMethod} />
      </div>

      {/* Card */}
      {/* Card — 20px radius to match internal FX widget */}
      <div className="rounded-[20px] bg-white shadow-2xl shadow-black/8 border border-gray-100/80 overflow-visible">
        {/* -------- YOU SEND -------- */}
        <div className="p-5 pb-4">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            You send
          </label>
          <div className="flex items-center justify-between mt-2.5 gap-3">
            <AmountInput
              value={sendInput}
              onChange={(v) => {
                setSendInput(v);
                setDirection('send');
              }}
              symbol={sendCfg.symbol}
            />
            <CurrencyDropdown
              value={sendCurrency}
              onChange={setSendCurrency}
              exclude={undefined}
            />
          </div>
        </div>

        {/* -------- FEE BREAKDOWN + RATE -------- */}
        <div className="relative border-t border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-gray-50/30">
          {/* Swap button */}
          <button
            onClick={handleSwap}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md shadow-black/5 transition-all hover:scale-110 hover:shadow-lg active:scale-95"
            aria-label="Swap currencies"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v12M7 1L3.5 4.5M7 1l3.5 3.5M7 13L3.5 9.5M7 13l3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <AnimatePresence mode="wait">
            {loading && !quote ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <QuoteSkeleton />
              </motion.div>
            ) : quote ? (
              <motion.div
                key={quote.isLocalTransfer ? 'local' : 'fx'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Conditionally render local vs FX breakdown */}
                {quote.isLocalTransfer ? (
                  <LocalBreakdown quote={quote} sendCfg={sendCfg} />
                ) : (
                  <FxBreakdown
                    quote={quote}
                    showFees={showFees}
                    setShowFees={setShowFees}
                    sendCfg={sendCfg}
                    sendCurrency={sendCurrency}
                  />
                )}

                {/* Stale rate indicator */}
                {quote.rateStale && !quote.isLocalTransfer && <StaleRateIndicator />}
              </motion.div>
            ) : (
              /* Empty state — no quote yet */
              <div className="h-8" />
            )}
          </AnimatePresence>

          {/* Loading bar */}
          {loading && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
              <motion.div
                className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-coral to-brand-ocean"
                initial={{ x: '-100%' }}
                animate={{ x: '400%' }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          )}
        </div>

        {/* -------- RECIPIENT GETS -------- */}
        <div className="p-5 pt-4">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Recipient gets
          </label>
          <div className="flex items-center justify-between mt-2.5 gap-3">
            <AmountInput
              value={receiveInput}
              onChange={(v) => {
                setReceiveInput(v);
                setDirection('receive');
              }}
              symbol={recvCfg.symbol}
            />
            <CurrencyDropdown
              value={receiveCurrency}
              onChange={setReceiveCurrency}
              exclude={undefined}
            />
          </div>
        </div>
      </div>

      {/* -------- VOLUME HINT + ETA + DISCLAIMERS -------- */}
      <AnimatePresence>
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="mt-4 space-y-3"
          >
            {/* Volume discount hint */}
            <AnimatePresence>
              {quote.volumeHint && (
                <VolumeHintBanner message={quote.volumeHint.message} />
              )}
            </AnimatePresence>

            {/* ETA */}
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-100">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-brand-coral shrink-0">
                <path d="M13 8A5 5 0 113 8a5 5 0 0110 0z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 5.5V8l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm">{quote.etaLabel}</span>
            </div>

            {/* CTA — violet gradient matching payoneer.com + internal FX widget */}
            <a
              href="https://www.payoneer.com/signup/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full rounded-2xl bg-gradient-to-r from-brand-violet-from to-brand-violet-to px-4 py-3.5 text-[15px] font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-brand-violet-to/25 active:scale-[0.98]"
            >
              Get started — it&apos;s free
            </a>

            {/* Disclaimers */}
            <div className="space-y-1 px-1">
              {quote.disclaimers.map((d, i) => (
                <p key={i} className="text-[11px] text-gray-400 leading-relaxed">
                  {d}
                </p>
              ))}
              {/* Stale rate disclaimer — shown alongside other disclaimers */}
              {quote.rateDisclaimer && (
                <p className="text-[11px] text-amber-500 leading-relaxed font-medium">
                  {quote.rateDisclaimer}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
