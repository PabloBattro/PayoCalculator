'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { currencies } from '@/config/currencies';
import type { QuoteResponse, CurrencyConfig } from '@/types/quote';

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

function CurrencySelect({
  value,
  onChange,
  exclude,
}: {
  value: string;
  onChange: (code: string) => void;
  exclude?: string;
}) {
  const selected = getCurrencyByCode(value);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl bg-gray-100 py-3 pl-4 pr-10 text-base font-semibold text-gray-900 outline-none transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-brand-coral/40 cursor-pointer"
      >
        {currencies
          .filter((c) => c.code !== exclude)
          .map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
      </select>
      {/* chevron */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function AmountInput({
  value,
  onChange,
  symbol,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  symbol: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-lg text-gray-400 font-medium">{symbol}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          // Allow only numbers and one decimal point
          const v = e.target.value.replace(/[^0-9.]/g, '');
          if (v.split('.').length > 2) return;
          onChange(v);
        }}
        disabled={disabled}
        placeholder="0.00"
        className="w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300 disabled:text-gray-500"
      />
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
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Derive the active amount from the direction
  const amount = direction === 'send' ? parseFloat(sendInput) : parseFloat(receiveInput);

  const fetchQuote = useCallback(async () => {
    if (!amount || amount <= 0 || sendCurrency === receiveCurrency) {
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

      // Update the "other" field with the computed value
      const sendCfg = getCurrencyByCode(data.sendCurrency);
      const recvCfg = getCurrencyByCode(data.receiveCurrency);
      if (direction === 'send') {
        setReceiveInput(fmt(data.receiveAmount, recvCfg));
      } else {
        setSendInput(fmt(data.sendAmount, sendCfg));
      }
    } catch {
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [amount, sendCurrency, receiveCurrency, direction]);

  // Debounced fetch
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(fetchQuote, 350);
    return () => clearTimeout(debounce.current);
  }, [fetchQuote]);

  // Swap currencies
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
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-white shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
        {/* -------- YOU SEND -------- */}
        <div className="p-5 pb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">You send</label>
          <div className="flex items-center justify-between mt-2 gap-3">
            <AmountInput
              value={sendInput}
              onChange={(v) => {
                setSendInput(v);
                setDirection('send');
              }}
              symbol={sendCfg.symbol}
            />
            <CurrencySelect
              value={sendCurrency}
              onChange={setSendCurrency}
              exclude={receiveCurrency}
            />
          </div>
        </div>

        {/* -------- FEE BREAKDOWN + RATE -------- */}
        <div className="relative border-t border-b border-gray-100 bg-gray-50/50">
          {/* Swap button */}
          <button
            onClick={handleSwap}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-transform hover:scale-110 active:scale-95"
            aria-label="Swap currencies"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M7 1L3.5 4.5M7 1l3.5 3.5M7 13L3.5 9.5M7 13l3.5-3.5" stroke="#252526" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <AnimatePresence>
            {quote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 py-3 space-y-2 text-sm">
                  {/* Fee row */}
                  <button
                    onClick={() => setShowFees(!showFees)}
                    className="flex w-full items-center justify-between text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-400">−</span>
                      <span>{sendCfg.symbol}{fmt(quote.fee, sendCfg)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>{quote.feeLabel}</span>
                      <motion.svg
                        animate={{ rotate: showFees ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        width="12" height="12" viewBox="0 0 12 12" fill="none"
                      >
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                        className="overflow-hidden pl-5 text-xs text-gray-500 space-y-1"
                      >
                        <div className="flex justify-between">
                          <span>Transfer fee</span>
                          <span>{sendCfg.symbol}{fmt(quote.fee, sendCfg)} {sendCurrency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>FX markup included</span>
                          <span>~{((1 - quote.exchangeRate / quote.midMarketRate) * 100).toFixed(2)}%</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Amount to convert */}
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-400">=</span>
                      <span>{sendCfg.symbol}{fmt(quote.amountToConvert, sendCfg)}</span>
                    </span>
                    <span>Amount you&apos;ll convert</span>
                  </div>

                  {/* Exchange rate */}
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-400">×</span>
                      <span>{quote.exchangeRate.toFixed(4)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      Exchange rate
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] text-gray-400 cursor-help" title={`Mid-market rate: ${quote.midMarketRate.toFixed(4)}`}>
                        i
                      </span>
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading bar */}
          {loading && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-gray-100">
              <motion.div
                className="h-full bg-brand-coral"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          )}
        </div>

        {/* -------- RECIPIENT GETS -------- */}
        <div className="p-5 pt-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recipient gets</label>
          <div className="flex items-center justify-between mt-2 gap-3">
            <AmountInput
              value={receiveInput}
              onChange={(v) => {
                setReceiveInput(v);
                setDirection('receive');
              }}
              symbol={recvCfg.symbol}
            />
            <CurrencySelect
              value={receiveCurrency}
              onChange={setReceiveCurrency}
              exclude={sendCurrency}
            />
          </div>
        </div>
      </div>

      {/* -------- ETA + DISCLAIMERS -------- */}
      <AnimatePresence>
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="mt-4 space-y-3"
          >
            {/* ETA */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-brand-coral">
                <path d="M13 8A5 5 0 113 8a5 5 0 0110 0z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 5.5V8l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{quote.etaLabel}</span>
            </div>

            {/* Disclaimers */}
            <div className="space-y-1">
              {quote.disclaimers.map((d, i) => (
                <p key={i} className="text-xs text-gray-400 leading-relaxed">{d}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

