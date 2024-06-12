import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProductTag extends Document {
  name: string;
  code: string;
  color: string;
  status: 'active' | 'inactive';
}

const productTagSchema: Schema<IProductTag> = new mongoose.Schema(
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
    color: {
      type: String,
      default: '#FF0000',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true, collection: 'product_tags' }
);

productTagSchema.pre<IProductTag>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().replace(/\s+/g, '_').toUpperCase();
  this.code = code;
  next();
});

const ProductTag: Model<IProductTag> = mongoose.model('ProductTag', productTagSchema);

export default ProductTag;
