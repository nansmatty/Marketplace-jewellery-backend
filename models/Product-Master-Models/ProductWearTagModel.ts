import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProductWearTag extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const productWearTagSchema: Schema<IProductWearTag> = new mongoose.Schema(
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
  { timestamps: true, collection: 'product_wear_tags' }
);

productWearTagSchema.pre<IProductWearTag>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().replace(/\s+/g, '_').toUpperCase();
  this.code = code;
  next();
});

const ProductWearTag: Model<IProductWearTag> = mongoose.model('ProductWearTag', productWearTagSchema);

export default ProductWearTag;
