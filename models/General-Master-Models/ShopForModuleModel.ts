import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShopForModule extends Document {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
}

const shopForModuleSchema: Schema<IShopForModule> = new mongoose.Schema(
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
  { timestamps: true, collection: 'shop_for_modules' }
);

shopForModuleSchema.pre<IShopForModule>('save', async function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const ShopForModule: Model<IShopForModule> = mongoose.model('ShopForModule', shopForModuleSchema);

export default ShopForModule;
