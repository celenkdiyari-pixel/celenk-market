export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
      padding: '1rem'
    }}>
      <div style={{ 
        maxWidth: '42rem', 
        width: '100%', 
        textAlign: 'center',
        background: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '9rem', 
          fontWeight: 'bold', 
          color: '#16a34a', 
          margin: '0 0 1rem 0',
          lineHeight: '1'
        }}>
          404
        </h1>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 1rem 0'
        }}>
          Sayfa Bulunamadı
        </h2>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#4b5563', 
          margin: '0 0 2rem 0'
        }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a 
            href="/" 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              color: '#111827',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Ana Sayfaya Dön
          </a>
          <a 
            href="/products" 
            style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: '#16a34a',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Ürünlere Git
          </a>
        </div>
      </div>
    </div>
  );
}
