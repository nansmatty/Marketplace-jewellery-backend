import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDiamondColor extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const diamondColorSchema: Schema<IDiamondColor> = new mongoose.Schema(
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
  { timestamps: true, collection: 'diamond_colors' }
);

diamondColorSchema.pre<IDiamondColor>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const DiamondColor: Model<IDiamondColor> = mongoose.model('DiamondColor', diamondColorSchema);

export default DiamondColor;
