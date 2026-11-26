import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catalog Desain',
  description:
    'Jelajahi katalog koleksi desain custom press-on nails dan nail art pilihan dari dinail.co.',
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
