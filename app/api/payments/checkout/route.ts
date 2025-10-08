import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getEnv(name: string): string | null {
	const value = process.env[name];
	return value && value.trim().length > 0 ? value : null;
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const orderId = searchParams.get('order_id');
	const amount = Number(searchParams.get('amount') || '0');
	const currency = searchParams.get('currency') || 'INR';

	// Build absolute callback URL from request
	const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
	const proto = request.headers.get('x-forwarded-proto') || 'http';
	const origin = host ? `${proto}://${host}` : '';

	const keyId = getEnv('RAZORPAY_KEY_ID') || getEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID');
	if (!keyId) {
		return new NextResponse('Razorpay key not configured', { status: 500 });
	}
	if (!orderId) {
		return new NextResponse('order_id required', { status: 400 });
	}

	const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Processing Payment…</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0b1020;color:#f2f5ff}
    .card{background:#121a36;border:1px solid #1f2b57;border-radius:12px;padding:24px;max-width:420px;width:100%;box-shadow:0 10px 30px rgba(0,0,0,0.35)}
    h1{font-size:18px;margin:0 0 8px}
    p{opacity:.85;margin:0}
    .spinner{margin:18px auto 0;width:32px;height:32px;border:3px solid #2a3976;border-top-color:#7aa2ff;border-radius:50%;animation:spin 0.8s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', function(){
      var options = {
        key: ${JSON.stringify(keyId)},
        order_id: ${JSON.stringify(orderId)},
        amount: ${JSON.stringify(amount)},
        currency: ${JSON.stringify(currency)},
        name: 'R-GRAM',
        description: 'Payment',
        timeout: 300,
        redirect: true,
        callback_url: ${JSON.stringify(origin ? `${origin}/api/payments/callback` : '/api/payments/callback')}
      };
      var rzp = new window.Razorpay(options);
      rzp.open();
    });
  </script>
</head>
<body>
  <div class="card">
    <h1>Opening Razorpay…</h1>
    <p>Do not close this window. You will be redirected to complete payment.</p>
    <div class="spinner"></div>
  </div>
</body>
</html>`;

	return new NextResponse(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' }
	});
}


