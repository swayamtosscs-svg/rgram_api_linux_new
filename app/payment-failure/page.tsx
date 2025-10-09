'use client';

import { useEffect, useState } from 'react';

export default function PaymentFailurePage() {
  const [countdown, setCountdown] = useState(10);
  const [orderId, setOrderId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Get order ID and error from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const order = urlParams.get('order_id');
    const error = urlParams.get('error');
    
    if (order) {
      setOrderId(order);
    }
    if (error) {
      setErrorMessage(decodeURIComponent(error));
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

  const handleRetryPayment = () => {
    // Go back to payment page or main app
    window.history.back();
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
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
        {/* Failure Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          animation: 'shake 0.5s ease-in-out'
        }}>
          ❌
        </div>

        {/* Failure Message */}
        <h1 style={{
          fontSize: '32px',
          margin: '0 0 16px',
          fontWeight: 'bold'
        }}>
          Payment Failed
        </h1>

        <p style={{
          fontSize: '18px',
          margin: '0 0 20px',
          opacity: 0.9
        }}>
          क्षमा करें, आपका payment process नहीं हो सका
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

        {errorMessage && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#ffcccb'
          }}>
            <strong>Error:</strong> {errorMessage}
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

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleRetryPayment}
            style={{
              background: 'linear-gradient(45deg, #ff9800, #f57c00)',
              border: 'none',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)';
            }}
          >
            फिर से Try करें
          </button>

          <button
            onClick={handleRedirectNow}
            style={{
              background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              border: 'none',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.3)';
            }}
          >
            Main App में जाएं
          </button>
        </div>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}</style>
      </div>
    </div>
  );
}
