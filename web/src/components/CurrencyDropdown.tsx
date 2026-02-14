'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { currencies } from '@/config/currencies';
import type { CurrencyConfig } from '@/types/quote';

interface Props {
  value: string;
  onChange: (code: string) => void;
  exclude?: string;
}

export default function CurrencyDropdown({ value, onChange, exclude }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = currencies.find((c) => c.code === value)!;

  const filtered = currencies.filter((c) => {
    if (c.code === exclude) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  });

  // Close on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
      setSearch('');
    }
  }, []);

  useEffect(() => {
    let focusTimer: ReturnType<typeof setTimeout>;
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, handleClickOutside]);

  const handleSelect = (c: CurrencyConfig) => {
    onChange(c.code);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 py-2.5 pl-3 pr-2.5 text-sm font-semibold text-gray-900 outline-none transition-all hover:bg-gray-100 hover:border-gray-300 focus:ring-2 focus:ring-brand-coral/30 cursor-pointer"
        type="button"
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span>{selected.code}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="text-gray-400"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl bg-white border border-gray-200 shadow-xl shadow-black/10 overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-gray-400 shrink-0"
                >
                  <path
                    d="M6.5 11a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM12 12l-2.5-2.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search currency..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No currencies found
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                      c.code === value ? 'bg-brand-coral/5' : ''
                    }`}
                    type="button"
                  >
                    <span className="text-xl leading-none">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {c.code}
                        </span>
                        {c.code === value && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            className="text-brand-coral"
                          >
                            <path
                              d="M3 7l3 3 5-6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{c.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {c.symbol}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

