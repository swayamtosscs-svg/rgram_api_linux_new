import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPaymentOrder extends Document {
	orderId: string; // Razorpay order_id
	receipt: string; // local receipt id
	amount: number; // in paise
	currency: string;
	status: 'created' | 'paid' | 'expired' | 'failed';
	createdAt: Date;
	expiresAt: Date; // 5 minutes from creation
	paidAt?: Date;
	paymentId?: string;
	signature?: string;
}

const PaymentOrderSchema = new Schema<IPaymentOrder>({
	orderId: { type: String, required: true, unique: true, index: true },
	receipt: { type: String, required: true },
	amount: { type: Number, required: true },
	currency: { type: String, default: 'INR' },
	status: { type: String, enum: ['created', 'paid', 'expired', 'failed'], default: 'created', index: true },
	createdAt: { type: Date, default: Date.now },
	expiresAt: { type: Date, required: true },
	paidAt: { type: Date },
	paymentId: { type: String },
	signature: { type: String }
});

const PaymentOrder: Model<IPaymentOrder> =
	mongoose.models.PaymentOrder || mongoose.model<IPaymentOrder>('PaymentOrder', PaymentOrderSchema);

export default PaymentOrder;


