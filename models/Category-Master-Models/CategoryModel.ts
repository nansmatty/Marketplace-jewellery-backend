import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ICategoryType } from './CategoryTypeModel';
import ErrorHandler from '../../utils/errorHandler';

export interface ICategory extends Document {
  name: string;
  code: string;
  categoryType: Types.ObjectId | ICategoryType;
  slug: string;
  status: 'active' | 'inactive';
}

const categorySchema: Schema<ICategory> = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
    },
    categoryType: {
      type: Schema.Types.ObjectId,
      ref: 'CategoryType',
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  { timestamps: true, collection: 'category' }
);

categorySchema.pre<ICategory>('save', async function (next) {
  try {
    const categoryType = await mongoose.model('CategoryType').findById(this.categoryType);

    if (!categoryType) {
      return next(new ErrorHandler('Category type not found', 404));
    }

    if (!this.isModified('name')) return next();

    let slugTrim = this.get('name').trim().replace(/\s+/g, '-').toLowerCase();
    let slug = categoryType.slug + '/' + slugTrim;

    let code = this.get('code').trim().toUpperCase();
    this.slug = slug;
    this.code = code;
    next();
  } catch (error: any) {
    next(error);
  }
});

const Category: Model<ICategory> = mongoose.model('Category', categorySchema);

export default Category;
