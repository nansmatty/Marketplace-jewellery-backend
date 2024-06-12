import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReturnReason extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const returnReasonSchema: Schema<IReturnReason> = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true, collection: 'return_reasons' }
);

returnReasonSchema.pre<IReturnReason>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const ReturnReason: Model<IReturnReason> = mongoose.model('ReturnReason', returnReasonSchema);

export default ReturnReason;
