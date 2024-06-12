import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProductLookTag extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const productLookTagSchema: Schema<IProductLookTag> = new mongoose.Schema(
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
    },
  },
  { timestamps: true, collection: 'product_look_tags' }
);

productLookTagSchema.pre<IProductLookTag>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().replace(/\s+/g, '_').toUpperCase();
  this.code = code;
  next();
});

const ProductLookTag: Model<IProductLookTag> = mongoose.model('ProductLookTag', productLookTagSchema);

export default ProductLookTag;
