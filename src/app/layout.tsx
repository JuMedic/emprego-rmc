import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header, Footer } from '@/components/layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Empregos RMC - Vagas de Emprego na Região Metropolitana de Campinas',
    template: '%s | Empregos RMC',
  },
  description: 'Encontre vagas de emprego na Região Metropolitana de Campinas. Portal de empregos com oportunidades em Campinas, Americana, Sumaré, Hortolândia, Indaiatuba e mais 13 cidades da RMC.',
  keywords: [
    'empregos',
    'vagas',
    'trabalho',
    'Campinas',
    'RMC',
    'Região Metropolitana de Campinas',
    'Americana',
    'Sumaré',
    'Hortolândia',
    'Indaiatuba',
    'currículo',
    'recrutamento',
  ],
  authors: [{ name: 'Empregos RMC' }],
  creator: 'Empregos RMC',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://empregosrmc.com.br',
    siteName: 'Empregos RMC',
    title: 'Empregos RMC - Vagas de Emprego na Região Metropolitana de Campinas',
    description: 'Encontre vagas de emprego na Região Metropolitana de Campinas.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Empregos RMC',
    description: 'Portal de empregos da Região Metropolitana de Campinas',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'seu-codigo-verificacao-google',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
