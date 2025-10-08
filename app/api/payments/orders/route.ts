import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/database';
import PaymentOrder from '@/lib/models/PaymentOrder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getEnv(name: string): string | null {
	const value = process.env[name];
	return value && value.trim().length > 0 ? value : null;
}

export async function POST(request: NextRequest) {
	try {
		const keyId = getEnv('RAZORPAY_KEY_ID') || getEnv('NEXT_PUBLIC_RAZORPAY_KEY_ID');
		const keySecret = getEnv('RAZORPAY_KEY_SECRET') || getEnv('NEXT_PUBLIC_RAZORPAY_KEY_SECRET');
		if (!keyId || !keySecret) {
			return NextResponse.json({ success: false, message: 'Razorpay keys not configured' }, { status: 500 });
		}

		const { amount, currency = 'INR', notes, success_url, failure_url } = await request.json();
		if (!amount || typeof amount !== 'number' || amount < 100) {
			return NextResponse.json({ success: false, message: 'amount (in paise) >= 100 required' }, { status: 400 });
		}


		// Try DB connect for persisting order, but don't fail order creation if DB is down
		let dbConnected = false;
		try {
			await connectDB();
			dbConnected = true;
		} catch (e) {
			console.error('Skipping DB persistence (connection failed):', (e as Error)?.message);
		}

		// Unique receipt for tracking
		const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

		// Create order via Razorpay REST
		const resp = await fetch('https://api.razorpay.com/v1/orders', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
			},
			body: JSON.stringify({ amount, currency, receipt, payment_capture: 1, notes })
		});

		if (!resp.ok) {
			const errText = await resp.text();
			return NextResponse.json({ success: false, message: 'Failed to create Razorpay order', error: errText }, { status: 502 });
		}

		const order = await resp.json();

		// Save with 5 minute expiry if DB is available
		if (dbConnected) {
			const createdAt = new Date();
			const expiresAt = new Date(createdAt.getTime() + 5 * 60 * 1000);
			await PaymentOrder.create({
				orderId: order.id,
				receipt,
				amount,
				currency,
				status: 'created',
				createdAt,
				expiresAt
			});
		}

		const params = new URLSearchParams({
			order_id: String(order.id),
			amount: String(order.amount),
			currency: String(order.currency)
		});
		if (success_url) params.set('success_url', String(success_url));
		if (failure_url) params.set('failure_url', String(failure_url));
		const checkoutUrl = `/api/payments/checkout?${params.toString()}`;
		return NextResponse.json({
			success: true,
			order,
			keyId,
			checkout_url: checkoutUrl
		});
	} catch (error) {
		return NextResponse.json({ success: false, message: 'Order creation failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
	}
}


