import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILabourChargeType extends Document {
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

const labourChargeTypeSchema: Schema<ILabourChargeType> = new mongoose.Schema(
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
  { timestamps: true, collection: 'labour_charge_types' }
);

labourChargeTypeSchema.pre<ILabourChargeType>('save', async function (next) {
  try {
    if (!this.isModified('code')) return next();
    let code = this.get('code').trim().toUpperCase();
    this.code = code;
    next();
  } catch (error: any) {
    next(error);
  }
});

const LabourChargeType: Model<ILabourChargeType> = mongoose.model('LabourChargeType', labourChargeTypeSchema);

export default LabourChargeType;
