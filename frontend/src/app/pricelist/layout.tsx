import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Price List',
  description:
    'Daftar harga lengkap paket custom press-on nails dinail.co mulai dari tier Simple hingga Prestige.',
};

export default function PriceListLayout({ children }: { children: React.ReactNode }) {
  return children;
}
