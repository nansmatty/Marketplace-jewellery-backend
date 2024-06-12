import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMetalPriceType extends Document {
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

const metalPriceTypeSchema: Schema<IMetalPriceType> = new mongoose.Schema(
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
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true, collection: 'metal_price_types' }
);

metalPriceTypeSchema.pre<IMetalPriceType>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const MetalPriceType: Model<IMetalPriceType> = mongoose.model('MetalPriceType', metalPriceTypeSchema);

export default MetalPriceType;
