import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBraceletSize extends Document {
  name: string;
  code: number;
  status: 'active' | 'inactive';
  description: string;
  is_default: 'active' | 'inactive';
}

const braceletSizeSchema: Schema<IBraceletSize> = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    code: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
    description: {
      type: String,
    },
    is_default: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
  },
  { timestamps: true, collection: 'bracelet_sizes' }
);

braceletSizeSchema.pre<IBraceletSize>('save', async function (next) {
  if (this.isModified('is_default') && this.is_default === 'active') {
    const otherDefaultSizes = await BraceletSize.find({ is_default: 'active', _id: { $ne: this._id } });

    await Promise.all(
      otherDefaultSizes.map(async (size) => {
        size.is_default = 'inactive';
        await size.save();
      })
    );
  }

  next();
});

const BraceletSize: Model<IBraceletSize> = mongoose.model('BraceletSize', braceletSizeSchema);

export default BraceletSize;
