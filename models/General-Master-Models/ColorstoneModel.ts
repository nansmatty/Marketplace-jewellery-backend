import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IColorstone extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const colorstoneSchema: Schema<IColorstone> = new mongoose.Schema(
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
  { timestamps: true, collection: 'colorstones' }
);

colorstoneSchema.pre<IColorstone>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const Colorstone: Model<IColorstone> = mongoose.model('Colorstone', colorstoneSchema);

export default Colorstone;
