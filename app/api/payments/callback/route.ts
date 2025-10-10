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
		const keySecret = getEnv('RAZORPAY_KEY_SECRET') || getEnv('NEXT_PUBLIC_RAZORPAY_KEY_SECRET');
		if (!keySecret) {
			return NextResponse.json({ success: false, message: 'Razorpay secret not configured' }, { status: 500 });
		}

		// Support JSON and form-POST callbacks from Razorpay
		let razorpay_order_id: string | undefined;
		let razorpay_payment_id: string | undefined;
		let razorpay_signature: string | undefined;

		const contentType = request.headers.get('content-type') || '';
		if (contentType.includes('application/json')) {
			const body = await request.json();
			razorpay_order_id = body.razorpay_order_id;
			razorpay_payment_id = body.razorpay_payment_id;
			razorpay_signature = body.razorpay_signature;
		} else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
			try {
				// Try using FormData API first
				const form = await request.formData();
				razorpay_order_id = String(form.get('razorpay_order_id') || '');
				razorpay_payment_id = String(form.get('razorpay_payment_id') || '');
				razorpay_signature = String(form.get('razorpay_signature') || '');
			} catch {
				// Fallback: parse as URL-encoded text
				const text = await request.text();
				const params = new URLSearchParams(text);
				razorpay_order_id = params.get('razorpay_order_id') || undefined;
				razorpay_payment_id = params.get('razorpay_payment_id') || undefined;
				razorpay_signature = params.get('razorpay_signature') || undefined;
			}
		} else {
			// As a last resort, check query params (if Razorpay redirected with GET)
			const { searchParams } = new URL(request.url);
			razorpay_order_id = searchParams.get('razorpay_order_id') || undefined;
			razorpay_payment_id = searchParams.get('razorpay_payment_id') || undefined;
			razorpay_signature = searchParams.get('razorpay_signature') || undefined;
		}
		if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
			return NextResponse.json({ success: false, message: 'Missing callback fields' }, { status: 400 });
		}


		let dbConnected = false;
		try {
			await connectDB();
			dbConnected = true;
		} catch (e) {
			console.error('Skipping DB read/write (connection failed):', (e as Error)?.message);
		}

		let record: any = null;
		if (dbConnected) {
			record = await PaymentOrder.findOne({ orderId: razorpay_order_id });
		}

		// If we have DB and record, enforce expiry; else skip
		if (dbConnected && record) {
			if (record.status !== 'paid' && new Date() > record.expiresAt) {
				record.status = 'expired';
				await record.save();
				return NextResponse.json({ success: false, message: 'Payment window expired' }, { status: 410 });
			}
		}

		// Verify signature
		const hmac = crypto.createHmac('sha256', keySecret);
		hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
		const expected = hmac.digest('hex');
		const isHex = /^[0-9a-f]+$/i.test(razorpay_signature);
		let isValid = false;
		if (isHex && razorpay_signature.length === expected.length) {
			try {
				isValid = crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(razorpay_signature, 'hex'));
			} catch {
				isValid = false;
			}
		}
		if (!isValid) {
			if (dbConnected && record) {
				record.status = 'failed';
				record.paymentId = razorpay_payment_id;
				record.signature = razorpay_signature;
				await record.save();
			}
			return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
		}

		if (dbConnected && record) {
			record.status = 'paid';
			record.paymentId = razorpay_payment_id;
			record.signature = razorpay_signature;
			record.paidAt = new Date();
			await record.save();
			return NextResponse.json({ success: true, message: 'Payment verified', data: { orderId: record.orderId, paidAt: record.paidAt } });
		}

		// DB not connected or record missing: still return signature result
		return NextResponse.json({ success: true, message: 'Payment verified (db skipped)', data: { orderId: razorpay_order_id } });
	} catch (error) {
		return NextResponse.json({ success: false, message: 'Callback processing failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
	}
}


