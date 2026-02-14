import { NextRequest, NextResponse } from 'next/server';
import type { QuoteRequest } from '@/types/quote';
import { calculateQuote } from '@/lib/quoteEngine';
import { getCurrency } from '@/config/currencies';

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();

    // --- Validation ---
    if (!body.sendCurrency || !body.receiveCurrency || !body.amount || !body.direction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (body.sendCurrency === body.receiveCurrency) {
      return NextResponse.json({ error: 'Send and receive currencies must be different' }, { status: 400 });
    }
    if (!getCurrency(body.sendCurrency) || !getCurrency(body.receiveCurrency)) {
      return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 });
    }
    if (body.amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    // --- Calculate ---
    const quote = calculateQuote({
      ...body,
      method: body.method || 'bank_transfer',
    });

    return NextResponse.json(quote);
  } catch (err) {
    console.error('Quote API error:', err);
    return NextResponse.json({ error: 'Failed to calculate quote' }, { status: 500 });
  }
}

