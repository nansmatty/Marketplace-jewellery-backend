import mongoose, { Document, Model, ObjectId, Schema } from 'mongoose';
import { IUser } from '../../Account-Master-Models/UserModel';
import { IProduct } from '../ProductModel';
import { IReviewReply } from './ProductReviewReplyModel';

//TODO: product ID requires the interface integration after completion of Product Module

export interface IProductReview extends Document {
  name: string;
  review_title: string;
  review_description: string;
  rating: number;
  review_reply: ObjectId[] | IReviewReply[];
  user_id: ObjectId | IUser;
  like: ObjectId[] | IUser[];
  dislike: ObjectId[] | IUser[];
  product_id: ObjectId | IProduct;
  imageUrls: string[];
  status: 'active' | 'inactive';
}

const productReviewSchema: Schema<IProductReview> = new Schema(
  {
    name: {
      type: String,
    },
    review_title: {
      type: String,
    },
    review_description: {
      type: String,
    },
    rating: {
      type: Number,
      default: 1,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    review_reply: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ReviewReply',
        required: true,
      },
    ],
    like: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislike: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    imageUrls: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true, collection: 'product_reviews' }
);

productReviewSchema.pre<IProductReview>('save', async function (next) {
  try {
    if (this.isModified('user_id') && this.user_id) {
      const getUserData = await mongoose.model('User').findById(this.user_id);
      this.name = getUserData.name;
      next();
    }
  } catch (error: any) {
    next(error);
  }
});

const ProductReview: Model<IProductReview> = mongoose.model('ProductReview', productReviewSchema);

export default ProductReview;
