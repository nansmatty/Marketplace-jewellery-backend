import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IMetalWeight extends Document {
  name: string;
  code: string;
  min_weight: number;
  max_weight: number;
  description: string;
  status: 'active' | 'inactive';
}

const metalWeightSchema: Schema<IMetalWeight> = new mongoose.Schema(
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
    min_weight: {
      type: Number,
      required: true,
    },
    max_weight: {
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
    collection: 'metal_weight_list',
  }
);

metalWeightSchema.pre<IMetalWeight>('save', function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const MetalWeight: Model<IMetalWeight> = mongoose.model('MetalWeight', metalWeightSchema);

export default MetalWeight;
