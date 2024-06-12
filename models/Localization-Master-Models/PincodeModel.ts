import mongoose, { Schema, Model, Document } from 'mongoose';
import ErrorHandler from '../../utils/errorHandler';

export interface IPincode extends Document {
  name: string;
  code: string;
  is_cod_available: 0 | 1;
  deliver_within: number;
  status: 'active' | 'inactive';
}

const pincodeSchema: Schema<IPincode> = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    is_cod_available: {
      type: Number,
      enum: [0, 1],
      default: 1,
      required: true,
    },
    deliver_within: {
      type: Number,
      default: 14,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'pincode',
  }
);

pincodeSchema.pre<IPincode>('save', function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const Pincode: Model<IPincode> = mongoose.model('Pincode', pincodeSchema);

export default Pincode;
