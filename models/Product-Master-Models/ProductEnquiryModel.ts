import mongoose, { Document, Model, ObjectId, Schema } from 'mongoose';
import { IUser } from '../Account-Master-Models/UserModel';
import { emailRegexPattern } from '../../utils/commonFunction';
import Product, { IProduct } from './ProductModel';
import ErrorHandler from '../../utils/errorHandler';

//TODO: product ID requires the interface integration after completion of Product Module

export interface IProductEnquiry extends Document {
  name: string;
  email: string;
  mobile_number: string;
  enquiry_message: string;
  product_name: string;
  product_id: ObjectId | IProduct;
  seller_id: ObjectId | IUser;
  repliedOrResolved: boolean;
}

const productEnquirySchema: Schema<IProductEnquiry> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: 'Please enter a valid email',
      },
    },
    mobile_number: {
      type: String,
      default: '',
    },
    enquiry_message: {
      type: String,
      required: true,
    },
    product_name: {
      type: String,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    repliedOrResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, collection: 'product_enquiries' }
);

productEnquirySchema.pre<IProductEnquiry>('save', async function (next) {
  const product = await Product.findById(this.product_id);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }
  this.product_name = product.title;
  this.seller_id = product.seller_id;
  next();
});

const ProductEnquiry: Model<IProductEnquiry> = mongoose.model('ProductEnquiry', productEnquirySchema);

export default ProductEnquiry;
