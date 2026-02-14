import QuoteWidget from '@/components/QuoteWidget';

export const metadata = {
  title: 'Payo Calculator — Embed',
};

/**
 * Standalone embed page — just the widget, no header/hero/footer.
 * Use in an <iframe> on any page:
 *   <iframe src="https://payocalculator.vercel.app/embed" .../>
 */
export default function EmbedPage() {
  return (
    <div className="flex min-h-screen items-start justify-center px-4 py-6 bg-transparent">
      <QuoteWidget />
    </div>
  );
}

