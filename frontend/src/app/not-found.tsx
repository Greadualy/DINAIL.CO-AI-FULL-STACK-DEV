import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div
      style={{
        backgroundColor: '#F3F0EE',
        minHeight: '100vh',
        overflowX: 'clip',
        display: 'flex',
        flexDirection: 'column',
        color: '#141413',
        fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '148px 24px 104px',
        }}
      >
        <div
          style={{
            maxWidth: 620,
            width: '100%',
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Eyebrow Label dengan Dot Oranye */}
          <p
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              lineHeight: 1,
              color: '#141413',
              marginBottom: '20px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            HALAMAN TIDAK DITEMUKAN
          </p>

          {/* Angka 404 Besar & Elegan */}
          <p
            aria-hidden="true"
            style={{
              fontSize: 'clamp(96px, 14vw, 120px)',
              fontWeight: 600,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              color: '#DED8D0',
              marginBottom: '24px',
              userSelect: 'none',
            }}
          >
            404
          </p>

          {/* Judul Utama */}
          <h1
            style={{
              fontSize: 'clamp(24px, 3.6vw, 34px)',
              fontWeight: 500,
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              color: '#141413',
              marginBottom: '14px',
              maxWidth: 520,
            }}
          >
            Ups, halaman yang kamu cari tidak tersedia.
          </h1>

          {/* Deskripsi Singkat */}
          <p
            style={{
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.65,
              color: '#57534E',
              marginBottom: '36px',
              maxWidth: 500,
            }}
          >
            Tautan mungkin sudah berubah atau halaman telah dipindahkan. Kamu bisa kembali ke beranda atau menjelajahi koleksi desain kami.
          </p>

          {/* Dua Tombol Aksi Sejajar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/"
              className="btn-primary"
              style={{
                padding: '13px 28px',
                fontSize: '15px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
            >
              <span>Kembali ke Beranda</span>
            </Link>

            <Link
              href="/catalog"
              className="btn-secondary"
              style={{
                padding: '13px 28px',
                fontSize: '15px',
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
            >
              <span>Lihat Catalog</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
