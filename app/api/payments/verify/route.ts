import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Ensure Node.js runtime (access to Node crypto and process.env)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type VerifyRequestBody = {
	order_id?: string;
	payment_id?: string;
	signature?: string;
};

function getEnv(name: string): string | null {
	const value = process.env[name];
	return value && value.trim().length > 0 ? value : null;
}

export async function POST(request: NextRequest) {
	try {
		let keySecret = getEnv('RAZORPAY_KEY_SECRET');
		// Dev-only fallback to help local testing if main var is missing
		if (!keySecret && process.env.NODE_ENV !== 'production') {
			keySecret = getEnv('NEXT_PUBLIC_RAZORPAY_KEY_SECRET');
		}
		if (!keySecret) {
			return NextResponse.json(
				{ success: false, message: 'Server is missing RAZORPAY_KEY_SECRET' },
				{ status: 500 }
			);
		}

		const body = (await request.json()) as VerifyRequestBody;
		const { order_id, payment_id, signature } = body || {};

		if (!order_id || !payment_id || !signature) {
			return NextResponse.json(
				{ success: false, message: 'order_id, payment_id and signature are required' },
				{ status: 400 }
			);
		}

		// Compute expected signature: HMAC_SHA256(order_id|payment_id)
		const hmac = crypto.createHmac('sha256', keySecret);
		hmac.update(`${order_id}|${payment_id}`);
		const expected = hmac.digest('hex');

		// Razorpay signature is a hex string. Validate before constant-time compare.
		const isHex = /^[0-9a-f]+$/i.test(signature);
		let isValid = false;
		if (isHex && signature.length === expected.length) {
			try {
				isValid = crypto.timingSafeEqual(
					Buffer.from(expected, 'hex'),
					Buffer.from(signature, 'hex')
				);
			} catch {
				isValid = false;
			}
		} else {
			isValid = false;
		}

		return NextResponse.json({ success: true, authenticated: isValid });
	} catch (error) {
		return NextResponse.json(
			{ success: false, message: 'Verification failed', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 400 }
		);
	}
}

export async function GET(request: NextRequest) {
	// Non-sensitive health info; reports only presence of env vars
	const hasServerSecret = !!getEnv('RAZORPAY_KEY_SECRET');
	const hasPublicFallback = !!getEnv('NEXT_PUBLIC_RAZORPAY_KEY_SECRET');
	return NextResponse.json({
		success: true,
		message: 'Razorpay verify endpoint',
		envVisible: {
			hasServerSecret,
			hasPublicFallback
		}
	});
}

