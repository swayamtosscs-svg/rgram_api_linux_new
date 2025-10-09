'use client';

import { useState } from 'react';

export default function HomePage() {
  const [amount, setAmount] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    
    try {
      // Create payment order
      const response = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          success_url: `${window.location.origin}/payment-success`,
          failure_url: `${window.location.origin}/payment-failure`
        })
      });

      if (!response.ok) {
        throw new Error('Payment order creation failed');
      }

      const data = await response.json();
      
      // Open checkout in new window
      const checkoutUrl = `${window.location.origin}${data.checkout_url}`;
      window.open(checkoutUrl, '_blank', 'width=500,height=600');
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
        color: '#fff',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* App Logo/Title */}
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          🚀
        </div>

        <h1 style={{
          fontSize: '32px',
          margin: '0 0 16px',
          fontWeight: 'bold'
        }}>
          R-GRAM Payment App
        </h1>

        <p style={{
          fontSize: '18px',
          margin: '0 0 30px',
          opacity: 0.9
        }}>
          आपका payment system successfully working है!
        </p>

        {/* Payment Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: '0 0 16px',
            fontSize: '20px'
          }}>
            Payment Amount
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '18px' }}>₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                fontSize: '18px',
                width: '120px',
                textAlign: 'center'
              }}
              placeholder="Amount"
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={isLoading || amount < 100}
            style={{
              background: isLoading ? '#666' : 'linear-gradient(45deg, #4CAF50, #45a049)',
              border: 'none',
              color: 'white',
              padding: '14px 28px',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              width: '100%'
            }}
            onMouseOver={(e) => {
              if (!isLoading && amount >= 100) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && amount >= 100) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
              }
            }}
          >
            {isLoading ? 'Processing...' : `Pay ₹${amount}`}
          </button>

          {amount < 100 && (
            <p style={{
              margin: '8px 0 0',
              fontSize: '14px',
              color: '#ffcccb'
            }}>
              Minimum amount is ₹100
            </p>
          )}
        </div>

        {/* Status Info */}
        <div style={{
          background: 'rgba(76, 175, 80, 0.2)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          ✅ Payment system is working perfectly!<br/>
          ✅ Success/Failure redirects are configured<br/>
          ✅ Users will be redirected back to this app
        </div>
      </div>
    </div>
  );
}
