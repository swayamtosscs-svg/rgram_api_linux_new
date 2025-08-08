import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  _id: string;
  requester: mongoose.Types.ObjectId; // User who requests
  purpose: string; // e.g., pilgrimage trip description
  goalAmount: number;
  raisedAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'closed';
  supportersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDonationPayment extends Document {
  _id: string;
  donation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId; // donor user
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String, required: true, maxlength: 500 },
  goalAmount: { type: Number, required: true, min: 1 },
  raisedAmount: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'closed'], default: 'pending' },
  supportersCount: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

DonationSchema.index({ requester: 1, createdAt: -1 });

const DonationPaymentSchema = new Schema<IDonationPayment>({
  donation: { type: Schema.Types.ObjectId, ref: 'Donation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 1 }
}, { timestamps: true });

DonationPaymentSchema.index({ donation: 1, createdAt: -1 });

export const DonationPayment = mongoose.models.DonationPayment || mongoose.model<IDonationPayment>('DonationPayment', DonationPaymentSchema);
export default mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
