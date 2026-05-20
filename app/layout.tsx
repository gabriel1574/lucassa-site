import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lucas Andrade — Desenvolvedor · SEO · Pentest',
  description:
    'Lucas Andrade — Desenvolvedor, especialista em SEO, criador de aplicações e pentester. Construo, posiciono e protejo produtos digitais.',
  authors: [{ name: 'Lucas Andrade' }],
  metadataBase: new URL('https://lucassa.me'),
  openGraph: {
    title: 'Lucas Andrade — Desenvolvedor · SEO · Pentest',
    description:
      'Construo, posiciono e protejo produtos digitais. Dev, SEO técnico e segurança ofensiva.',
    url: 'https://lucassa.me',
    siteName: 'Lucas Andrade',
    locale: 'pt_BR',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
