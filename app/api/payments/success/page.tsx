import { NextRequest } from 'next/server';

export default function PaymentSuccessPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0b1020',
      color: '#f2f5ff',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
    }}>
      <div style={{
        background: '#121a36',
        border: '1px solid #1f2b57',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>✅</div>
        <h1 style={{
          fontSize: '24px',
          margin: '0 0 8px',
          color: '#7aa2ff'
        }}>Payment Successful!</h1>
        <p style={{
          opacity: 0.85,
          margin: '0 0 16px'
        }}>Your payment has been processed successfully.</p>
        <button 
          onClick={() => window.close()}
          style={{
            background: '#3657ff',
            border: '0',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Close Window
        </button>
      </div>
    </div>
  );
}
