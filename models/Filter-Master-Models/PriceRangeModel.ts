import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IPriceRange extends Document {
  name: string;
  code: string;
  min_amount: number;
  max_amount: number;
  description: string;
  status: 'active' | 'inactive';
}

const priceRangeSchema: Schema<IPriceRange> = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
    },
    min_amount: {
      type: Number,
      required: true,
    },
    max_amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'price_ranges',
  }
);

priceRangeSchema.pre<IPriceRange>('save', function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const PriceRange: Model<IPriceRange> = mongoose.model('PriceRange', priceRangeSchema);

export default PriceRange;
