import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Payo Calculator — Embed',
};

/**
 * Minimal layout for the embed route — no header, no chrome.
 * Background is transparent so it blends with the host page.
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
        style={{ background: 'transparent' }}
      >
        {children}
      </body>
    </html>
  );
}

