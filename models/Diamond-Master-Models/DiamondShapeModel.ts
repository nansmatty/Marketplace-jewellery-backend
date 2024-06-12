import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDiamondShape extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const diamondShapeSchema: Schema<IDiamondShape> = new mongoose.Schema(
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
  { timestamps: true, collection: 'diamond_shapes' }
);

diamondShapeSchema.pre<IDiamondShape>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const DiamondShape: Model<IDiamondShape> = mongoose.model('DiamondShape', diamondShapeSchema);

export default DiamondShape;
