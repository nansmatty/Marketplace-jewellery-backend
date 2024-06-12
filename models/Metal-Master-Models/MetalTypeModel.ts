import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IMetalPriceType } from './MetalPriceTypeModel';
import ErrorHandler from '../../utils/errorHandler';

export interface IMetalType extends Document {
  name: string;
  code: string;
  metalPriceType: Types.ObjectId | IMetalPriceType;
  status: 'active' | 'inactive';
  description: string;
}

const metalTypeSchema: Schema<IMetalType> = new mongoose.Schema(
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
    metalPriceType: {
      type: Schema.Types.ObjectId,
      ref: 'MetalPriceType',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true, collection: 'metal_types' }
);

metalTypeSchema.pre<IMetalType>('save', async function (next) {
  try {
    const metalPriceType = await mongoose.model('MetalPriceType').findById(this.metalPriceType);

    if (!metalPriceType) {
      return next(new ErrorHandler('Metal price type not found', 404));
    }

    if (!this.isModified('code')) return next();
    let code = this.get('code').trim().toUpperCase();
    this.code = code;
    next();
  } catch (error: any) {
    next(error);
  }
});

const MetalType: Model<IMetalType> = mongoose.model('MetalType', metalTypeSchema);

export default MetalType;
