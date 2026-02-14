import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { generateOrganizationSchema } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ScholarAssist - Expert Academic Guidance & Support',
    template: '%s | ScholarAssist',
  },
  description: 'Professional academic guidance for thesis writing, research papers, essays, and project documentation. Expert support to help you excel.',
  keywords: ['academic assistance', 'thesis writing', 'research paper help', 'essay writing', 'academic guidance', 'dissertation support'],
  authors: [{ name: 'ScholarAssist' }],
  openGraph: {
    type: 'website',
    siteName: 'ScholarAssist',
    title: 'ScholarAssist - Expert Academic Guidance & Support',
    description: 'Professional academic guidance for thesis writing, research papers, essays, and project documentation.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateOrganizationSchema()),
          }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-[var(--font-body)] antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
