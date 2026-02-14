import Image from 'next/image';
import QuoteWidget from '@/components/QuoteWidget';

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-coral/10 text-brand-coral">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Image
            src="/payoneer-logo.svg"
            alt="Payoneer"
            width={130}
            height={28}
            priority
            className="h-6 w-auto"
          />
          <a
            href="https://www.payoneer.com/signup/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-coral px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-coral/90 hover:shadow-lg hover:shadow-brand-coral/20 active:scale-[0.98]"
          >
            Get started
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full py-12 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-coral/10 px-3 py-1 text-xs font-semibold text-brand-coral mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-coral animate-pulse" />
                Indicative estimates
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                Know your{' '}
                <span className="text-brand-coral">transfer costs</span>{' '}
                before you send
              </h1>

              <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                See fees, exchange rates, and delivery times instantly.
                No login required — just pick your currencies and amount.
              </p>

              {/* Features */}
              <div className="mt-8 space-y-5">
                <FeatureItem
                  icon={
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 1v16M1 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  }
                  title="Transparent fees"
                  desc="See exactly what you'll pay — no hidden charges"
                />
                <FeatureItem
                  icon={
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M3 9l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                  title="Real-time exchange rates"
                  desc="Compare with mid-market rates to understand total cost"
                />
                <FeatureItem
                  icon={
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M9 6v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  }
                  title="Delivery estimates"
                  desc="Know when your recipient will receive the funds"
                />
              </div>
            </div>

            {/* Right — Widget */}
            <div className="flex justify-center lg:justify-end">
              <QuoteWidget />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Payoneer Global Inc. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 text-center sm:text-right">
            This tool provides indicative estimates only. Actual fees and rates may vary.
          </p>
        </div>
      </footer>
    </div>
  );
}
