import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDiamondSieves extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const diamondSievesSchema: Schema<IDiamondSieves> = new mongoose.Schema(
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
  { timestamps: true, collection: 'diamond_sieves' }
);

diamondSievesSchema.pre<IDiamondSieves>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const DiamondSieves: Model<IDiamondSieves> = mongoose.model('DiamondSieves', diamondSievesSchema);

export default DiamondSieves;
