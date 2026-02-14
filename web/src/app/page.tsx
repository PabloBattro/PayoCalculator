import QuoteWidget from '@/components/QuoteWidget';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Payo Calculator
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Estimate your cross-border transfer costs
        </p>
      </div>

      {/* Quote Widget */}
      <QuoteWidget />

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-gray-400">
        <p>Powered by Payoneer &middot; Indicative estimates only</p>
      </footer>
    </div>
  );
}
