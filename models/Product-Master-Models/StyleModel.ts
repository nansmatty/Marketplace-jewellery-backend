import mongoose, { Schema, ObjectId, Model, Document } from 'mongoose';
import Category, { ICategory } from '../Category-Master-Models/CategoryModel';
import CategoryType, { ICategoryType } from '../Category-Master-Models/CategoryTypeModel';
import ErrorHandler from '../../utils/errorHandler';

export interface IStyle extends Document {
  title: string;
  code: string;
  category_ids: ObjectId[] | ICategory[];
  category_type_ids: ObjectId[] | ICategoryType[];
  slug: string;
  status: 'active' | 'inactive';
  clearCategoryIds: () => void;
  clearCategoryTypeIds: () => void;
}

const styleSchema: Schema<IStyle> = new Schema(
  {
    title: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
      required: true,
    },
    category_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    category_type_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CategoryType',
      },
    ],
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
  { timestamps: true, style: 'styles' }
);

styleSchema.pre<IStyle>('save', async function (next) {
  try {
    for (const categoryId of this.category_ids) {
      const checkCategoryId = await Category.findById(categoryId);
      if (!checkCategoryId) {
        return next(new ErrorHandler('Category not found', 404));
      }
    }

    for (const categoryTypeId of this.category_type_ids) {
      const checkCategoryTypeId = await CategoryType.findById(categoryTypeId);
      if (!checkCategoryTypeId) {
        return next(new ErrorHandler('Category type not found', 404));
      }
    }

    if (this.isModified('title')) {
      const slugTrim = this.get('title').trim().replace(/\s+/g, '-').toLowerCase();
      this.slug = slugTrim;
    }

    if (this.isModified('code')) {
      const code = this.get('code').trim().toUpperCase();
      this.code = code;
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

styleSchema.methods.clearCategoryIds = function () {
  this.category_ids = [];
};

styleSchema.methods.clearCategoryTypeIds = function () {
  this.category_type_ids = [];
};

const Style: Model<IStyle> = mongoose.model('Style', styleSchema);

export default Style;
