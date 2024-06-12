import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICategoryType extends Document {
  name: string;
  code: string;
  slug: string;
  status: 'active' | 'inactive';
}

const categoryTypeSchema: Schema<ICategoryType> = new mongoose.Schema(
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
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'category_types',
  }
);

categoryTypeSchema.pre<ICategoryType>('save', async function (next) {
  if (!this.isModified('name')) return next();

  let code = this.get('code').trim().toUpperCase();
  let slugTrim = this.get('name').trim().replace(/\s+/g, '-').toLowerCase();
  let slug = `/jewellery/${slugTrim}`;

  this.code = code;
  this.slug = slug;
  next();
});

const CategoryType: Model<ICategoryType> = mongoose.model('CategoryType', categoryTypeSchema);

export default CategoryType;
