import type { Metadata, Viewport } from 'next';
import './globals.css';

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
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
