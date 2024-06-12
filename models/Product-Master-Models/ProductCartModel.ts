import mongoose, { Document, Model, ObjectId, Schema, Types } from 'mongoose';
import { IUser } from '../Account-Master-Models/UserModel';
import { IProduct } from './ProductModel';

export interface ICart extends Document {
  user_id: ObjectId | IUser;
  cart_items: ICartItems[];
}

export interface ICartItems {
  product_id: ObjectId | IProduct;
  qty: number;
  metal_weight: number;
  metal_data: {
    metal_type: string;
    metal_purity: string;
  };
  diamond_data: [
    {
      carat: number;
      pieces: number;
      diamond_shape: string;
      diamond_quality: string;
      dimond_sieve: string;
    },
  ];
}

const cartSchema: Schema<ICart> = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: 'User',
    },

    cart_items: [
      {
        product_id: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        qty: {
          type: Number,
          default: 1,
        },
        metal_weight: {
          type: Number,
        },
        metal_data: {
          metal_purity: {
            type: String,
          },
          metal_type: {
            type: String,
          },
        },
        diamond_data: [
          {
            diamond_quality: {
              type: String,
            },
            diamond_shape: {
              type: String,
            },
            diamond_sieve: {
              type: String,
            },
            carat: {
              type: Number,
            },
            pieces: {
              type: Number,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true, collection: 'cart_items' }
);

const Cart: Model<ICart> = mongoose.model('Cart', cartSchema);

export default Cart;
