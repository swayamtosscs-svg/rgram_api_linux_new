'use client';

import { useEffect, useState } from 'react';

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = useState(5);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Get order ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const order = urlParams.get('order_id');
    if (order) {
      setOrderId(order);
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirect to main app
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRedirectNow = () => {
    window.location.href = '/';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Success Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'bounce 2s infinite'
        }}>
          ✅
        </div>

        {/* Success Message */}
        <h1 style={{
          fontSize: '32px',
          margin: '0 0 16px',
          fontWeight: 'bold'
        }}>
          Payment Successful!
        </h1>

        <p style={{
          fontSize: '18px',
          margin: '0 0 20px',
          opacity: 0.9
        }}>
          आपका payment successfully process हो गया है
        </p>

        {orderId && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <strong>Order ID:</strong> {orderId}
          </div>
        )}

        {/* Redirect Info */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '16px' }}>
            आपको automatically main app में redirect किया जा रहा है...
          </p>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
            {countdown} seconds
          </p>
        </div>

        {/* Manual Redirect Button */}
        <button
          onClick={handleRedirectNow}
          style={{
            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
          }}
        >
          अभी Main App में जाएं
        </button>

        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
