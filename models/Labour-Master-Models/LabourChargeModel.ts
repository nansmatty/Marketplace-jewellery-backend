import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IMetalPriceType } from '../Metal-Master-Models/MetalPriceTypeModel';
import ErrorHandler from '../../utils/errorHandler';
import { ILabourChargeType } from './LabourChargeTypeModel';

export interface ILabourCharge extends Document {
  name: string;
  code: string;
  labourChargeType: Types.ObjectId | ILabourChargeType;
  metalPriceType: Types.ObjectId | IMetalPriceType;
  status: 'active' | 'inactive';
  description: string;
}

const labourChargeSchema: Schema<ILabourCharge> = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    code: {
      type: String,
    },
    labourChargeType: {
      type: Schema.Types.ObjectId,
      ref: 'LabourChargeType',
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
  { timestamps: true, collection: 'labour_charge' }
);

labourChargeSchema.pre<ILabourCharge>('save', async function (next) {
  try {
    const metalPriceType = await mongoose.model('MetalPriceType').findById(this.metalPriceType);

    if (!metalPriceType) {
      return next(new ErrorHandler('Metal price type not found', 404));
    }

    if (this.isModified('labourChargeType') && this.labourChargeType) {
      const labourChargeTypeU = await mongoose.model('LabourChargeType').findById(this.labourChargeType);

      if (!labourChargeTypeU) {
        return next(new ErrorHandler('Labour charge type not found', 404));
      }

      this.name = labourChargeTypeU.name;
      this.code = labourChargeTypeU.code;

      next();
    }
  } catch (error: any) {
    next(error);
  }
});

const LabourCharge: Model<ILabourCharge> = mongoose.model('LabourCharge', labourChargeSchema);

export default LabourCharge;
