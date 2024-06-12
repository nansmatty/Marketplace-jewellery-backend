import mongoose, { Document, Model, ObjectId, Schema, Types } from 'mongoose';
import { IUser } from '../Account-Master-Models/UserModel';
import { IProduct } from './ProductModel';

export interface IWishlist extends Document {
  user_id: ObjectId | IUser;
  product_id: ObjectId[] | IProduct[];
}

const wishlistSchema: Schema<IWishlist> = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product_id: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
  },
  { timestamps: true, collection: 'wishlist' }
);

const Wishlist: Model<IWishlist> = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
