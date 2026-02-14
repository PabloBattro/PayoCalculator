import { NextRequest, NextResponse } from 'next/server';
import type { QuoteRequest } from '@/types/quote';
import { calculateQuote } from '@/lib/quoteEngine';
import { getCurrency } from '@/config/currencies';

const VALID_DIRECTIONS = new Set(['send', 'receive']);
const VALID_METHODS = new Set(['bank_transfer']);
const MAX_AMOUNT = 10_000_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // --- Validation ---
    const { sendCurrency, receiveCurrency, direction, method } = body ?? {};
    const amount = Number(body?.amount);

    if (
      typeof sendCurrency !== 'string' ||
      typeof receiveCurrency !== 'string' ||
      typeof direction !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Missing required fields: sendCurrency, receiveCurrency, amount, direction' },
        { status: 400 },
      );
    }
    if (!VALID_DIRECTIONS.has(direction)) {
      return NextResponse.json(
        { error: `Invalid direction. Must be one of: ${[...VALID_DIRECTIONS].join(', ')}` },
        { status: 400 },
      );
    }
    if (Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }
    if (amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Amount exceeds maximum (${MAX_AMOUNT.toLocaleString()})` },
        { status: 400 },
      );
    }
    if (sendCurrency === receiveCurrency) {
      return NextResponse.json({ error: 'Send and receive currencies must be different' }, { status: 400 });
    }
    if (!getCurrency(sendCurrency) || !getCurrency(receiveCurrency)) {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
    }

    const resolvedMethod = VALID_METHODS.has(method) ? method : 'bank_transfer';

    // --- Calculate ---
    const quote = calculateQuote({
      sendCurrency,
      receiveCurrency,
      amount,
      direction: direction as QuoteRequest['direction'],
      method: resolvedMethod,
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Rate data unavailable for this currency pair' },
        { status: 400 },
      );
    }

    return NextResponse.json(quote);
  } catch (err) {
    console.error('Quote API error:', err);
    return NextResponse.json({ error: 'Failed to calculate quote' }, { status: 500 });
  }
}

