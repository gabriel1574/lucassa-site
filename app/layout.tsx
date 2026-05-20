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

/* SITE_URL: URL canonica de producao. Hoje aponta p/ o Vercel pq o
   dominio lucassa.me ainda nao foi conectado ao projeto. Quando o DNS
   estiver apontando p/ o Vercel, trocar de volta p/ 'https://lucassa.me'
   pra Google e crawlers usarem o dominio limpo como canonical. */
const SITE_URL = 'https://lucassa-site.vercel.app';
const SITE_TITLE = 'Lucas Andrade — Desenvolvedor · SEO · Pentest';
const SITE_DESCRIPTION =
  'Lucas Andrade — Desenvolvedor, especialista em SEO, criador de aplicações e pentester. Construo, posiciono e protejo produtos digitais.';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  authors: [{ name: 'Lucas Andrade', url: SITE_URL }],
  creator: 'Lucas Andrade',
  publisher: 'Lucas Andrade',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
    languages: {
      'pt-BR': SITE_URL,
      'x-default': SITE_URL,
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description:
      'Construo, posiciono e protejo produtos digitais. Dev, SEO técnico e segurança ofensiva.',
    url: SITE_URL,
    siteName: 'Lucas Andrade',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/Imagens/me.avif',
        width: 640,
        height: 640,
        alt: 'Lucas Andrade',
        type: 'image/avif',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/Imagens/me.avif'],
    creator: '@lucassame',
    site: '@lucassame',
  },
  category: 'technology',
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
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Lucas Andrade',
              url: SITE_URL,
              image: `${SITE_URL}/Imagens/me.avif`,
              jobTitle: 'Desenvolvedor · SEO · Pentest',
              description: SITE_DESCRIPTION,
              email: 'contato@lucassa.com',
              telephone: '+55 11 96978-9917',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'BR',
              },
              sameAs: [
                'https://linkedin.com/in/lucassame',
              ],
              knowsAbout: [
                'Desenvolvimento Web',
                'SEO',
                'Pentest',
                'Segurança Ofensiva',
                'JavaScript',
                'Python',
                'PHP',
                'React',
                'Node.js',
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
