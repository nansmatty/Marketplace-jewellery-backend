import mongoose, { Model, ObjectId, Schema, Document } from 'mongoose';
import { IUser } from '../../Account-Master-Models/UserModel';
import { IProductReview } from './ProductReviewModel';

export interface IReviewReply extends Document {
  review_id: ObjectId | IProductReview;
  name: string;
  review_description: string;
  user_id: ObjectId | IUser;
  like: ObjectId[] | IUser[];
  dislike: ObjectId[] | IUser[];
  status: 'active' | 'inactive';
}

const reviewReplySchema: Schema<IReviewReply> = new Schema(
  {
    review_id: {
      type: Schema.Types.ObjectId,
      ref: 'ProductReview',
      required: true,
    },
    name: {
      type: String,
    },
    review_description: {
      type: String,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true, collection: 'reviews_reply' }
);

reviewReplySchema.pre<IReviewReply>('save', async function (next) {
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

const ReviewReply: Model<IReviewReply> = mongoose.model('ReviewReply', reviewReplySchema);

export default ReviewReply;
