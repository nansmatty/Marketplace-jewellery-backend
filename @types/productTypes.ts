import { ObjectId } from 'mongoose';
import { ICategory } from '../models/Category-Master-Models/CategoryModel';
import { ICategoryType } from '../models/Category-Master-Models/CategoryTypeModel';
import { TCode, TColor, TDescription, TName, TStatus, TTitle } from './commonTypes';
import { IUser } from '../models/Account-Master-Models/UserModel';
import { IReviewReply } from '../models/Product-Master-Models/Product-Review-Models/ProductReviewReplyModel';
import { IProduct } from '../models/Product-Master-Models/ProductModel';
import { TMobileNo } from './accountTypes';
import { TUserEmailBody } from './userTypes';

export type TProductGeneric = TName & TStatus & TCode & TDescription;
export type TProductTag = TName & TStatus & TColor & TCode;
export type TUpdateProductTag = TName & TStatus & TColor;

export type TLooseDiamondsParams = {
  pageSize?: string;
  pageNumber?: string;
  min_final_price?: number;
  max_final_price?: number;
  min_carat?: number;
  max_carat?: number;
  shape?: string;
  color?: string;
  clarity?: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluroscent?: string;
  eye_clean?: string;
  certificate?: string;
};

export type TLooseDiamonds = {
  item_id: number;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  fluroscent: string;
  eye_clean: string;
  certificate: string;
  measurement: string;
  total_depth: number;
  table_width: number;
  certificate_num: number;
  additional_charge_type: 'PERCENTAGE' | 'FLAT';
  additional_charge: number;
  discount_charge_type: 'PERCENTAGE' | 'FLAT';
  discount_charge: number;
  price_per_carat: number;
};

export type TCollectionAndStyle = TTitle &
  TCode &
  TStatus & {
    category_ids: ObjectId[] | ICategory[];
    category_type_ids: ObjectId[] | ICategoryType[];
  };

export type TReviewGeneric = {
  name: string;
  review_description: string;
  user_id: ObjectId | IUser;
  like: ObjectId[] | IUser[];
  dislike: ObjectId[] | IUser[];
  status: 'active' | 'inactive';
};

export type TProductReview = TReviewGeneric & {
  review_title: string;
  rating: number;
  review_reply: ObjectId[] | IReviewReply[];
  product_id: ObjectId | IProduct;
  imageUrls: string[];
};

export type TProductEnquiry = TName &
  TMobileNo &
  TUserEmailBody & {
    enquiry_message: string;
    product_id: ObjectId | IProduct;
    repliedOrResolved: boolean;
  };
