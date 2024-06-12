import mongoose, { Model, ObjectId, Schema } from 'mongoose';
import { IUser } from '../Account-Master-Models/UserModel';
import { IProduct } from './ProductModel';

export interface IFixedProductPrice extends Document {
  seller_id: ObjectId | IUser;
  product_id: ObjectId | IProduct;
  product_price: number;
}

const fixedProductPriceSchema: Schema<IFixedProductPrice> = new Schema(
  {
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    product_price: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  { timestamps: true, collection: 'fixed_product_price' }
);

const FixedProductPrice: Model<IFixedProductPrice> = mongoose.model('FixedProductPrice', fixedProductPriceSchema);

export default FixedProductPrice;
