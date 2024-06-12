import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDiamondClarity extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const diamondClaritySchema: Schema<IDiamondClarity> = new mongoose.Schema(
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
  { timestamps: true, collection: 'diamond_clarity' }
);

diamondClaritySchema.pre<IDiamondClarity>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const DiamondClarity: Model<IDiamondClarity> = mongoose.model('DiamondClarity', diamondClaritySchema);

export default DiamondClarity;
