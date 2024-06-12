import mongoose, { Document, Model, ObjectId, Schema } from 'mongoose';
import { IUser } from '../Account-Master-Models/UserModel';

export interface IProduct extends Document {
  seller_id: ObjectId | IUser;
  title: string;
  sku: string;
  hsn_code: number;
  type: string;
  category_type: string;
  category: string;
  style: string;
  product_collection: string;
  labour_type: string;
  occasion: string;
  size: string[] | number[];
  default_size: string | number;
  gross_weight: number;
  shop_for_module: string;
  product_look_tag: string;
  product_wear_tag: string;
  product_tag: string;
  customizable: 'yes' | 'no' | undefined;
  certificate: 'yes' | 'no' | undefined;
  hallmark: 'yes' | 'no' | undefined;
  stamping: 'yes' | 'no' | undefined;
  dimension_length: string;
  dimension_width: string;
  default_metal_made_type: string;
  default_metal_type: string;
  default_metal_purity_type: string;
  default_metal_weight: number;
  metal_made_type: string;
  metal_purity: string[];
  metal_type: string[];
  net_weight: number;
  colorstone: string[];
  colorstone_shape: string[];
  colorstone_weight: string[] | Number[];
  colorstone_pcs: string[] | Number[];
  diamond_shape: string[];
  diamond_quality: string;
  diamond_sieve: string[];
  diamond_weight: string[] | Number[];
  diamond_pcs: string[] | Number[];
  is_mrp: 'yes' | 'no';
  // mrp_price: number;
  short_description: string;
  long_description: string;
  min_order_qty: number;
  max_order_qty: number;
  available_for_order: 'yes' | 'no';
  seo_title: string;
  seo_keywords: string[];
  seo_description: string;
  status: 'active' | 'inactive';
}

const productSchema: Schema<IProduct> = new Schema(
  {
    seller_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
    },

    sku: {
      type: String,
      required: true,
    },

    hsn_code: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      default: '',
    },
    category_type: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: '',
    },
    style: {
      type: String,
      default: '',
    },
    product_collection: {
      type: String,
      default: '',
    },
    labour_type: {
      type: String,
      default: '',
    },
    occasion: {
      type: String,
      default: '',
    },
    size: [
      {
        type: Schema.Types.Mixed,
        default: '',
      },
    ],
    default_size: {
      type: Schema.Types.Mixed,
      default: '',
    },
    gross_weight: {
      type: Number,
      default: 0,
    },
    shop_for_module: {
      type: String,
      default: '',
    },
    product_look_tag: {
      type: String,
      default: '',
    },
    product_wear_tag: {
      type: String,
      default: '',
    },
    product_tag: {
      type: String,
      default: '',
    },
    customizable: {
      type: String,
      allowedValues: ['yes', 'no', ''],
      default: '',
    },
    certificate: {
      type: String,
      allowedValues: ['yes', 'no', ''],
      default: '',
    },
    hallmark: {
      type: String,
      allowedValues: ['yes', 'no', ''],
      default: '',
    },
    stamping: {
      type: String,
      allowedValues: ['yes', 'no', ''],
      default: '',
    },
    dimension_length: {
      type: String,
      default: '',
    },
    dimension_width: {
      type: String,
      default: '',
    },
    default_metal_made_type: {
      type: String,
      default: '',
    },
    default_metal_type: {
      type: String,
      default: '',
    },
    default_metal_purity_type: {
      type: String,
      default: '',
    },
    default_metal_weight: {
      type: Number,
      default: 0,
    },
    metal_made_type: {
      type: String,
      default: '',
    },
    metal_purity: [
      {
        type: String,
        default: '',
      },
    ],
    metal_type: [
      {
        type: String,
        default: '',
      },
    ],
    net_weight: {
      type: Number,
      default: 0,
    },
    colorstone: [
      {
        type: String,
        default: '',
      },
    ],
    colorstone_shape: [
      {
        type: String,
        default: '',
      },
    ],
    colorstone_weight: [
      {
        type: Schema.Types.Mixed,
        default: '',
      },
    ],
    colorstone_pcs: [
      {
        type: Schema.Types.Mixed,
        default: '',
      },
    ],
    diamond_shape: [
      {
        type: String,
        default: '',
      },
    ],
    diamond_quality: {
      type: String,
      default: '',
    },
    diamond_sieve: [
      {
        type: String,
        default: '',
      },
    ],
    diamond_weight: [
      {
        type: Schema.Types.Mixed,
        default: '',
      },
    ],
    diamond_pcs: [
      {
        type: Schema.Types.Mixed,
        default: '',
      },
    ],
    is_mrp: {
      type: String,
      allowedValues: ['yes', 'no'],
    },
    // mrp_price: {
    //   type: Number,
    //   default: 0,
    // },
    short_description: {
      type: String,
      default: '',
    },
    long_description: {
      type: String,
      default: '',
    },
    min_order_qty: {
      type: Number,
      default: 1,
    },
    max_order_qty: {
      type: Number,
      default: 10,
    },
    available_for_order: {
      type: String,
      allowedValues: ['yes', 'no'],
    },
    seo_title: {
      type: String,
      default: '',
    },
    seo_keywords: [
      {
        type: String,
        default: '',
      },
    ],
    seo_description: {
      type: String,
    },
    status: {
      type: String,
      allowedValues: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true, collection: 'products' }
);

const Product: Model<IProduct> = mongoose.model('Product', productSchema);

export default Product;
