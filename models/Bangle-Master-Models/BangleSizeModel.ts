import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBangleSize extends Document {
  name: number;
  code: number;
  status: 'active' | 'inactive';
  description: string;
  is_default: 'active' | 'inactive';
}

const bangleSizeSchema: Schema<IBangleSize> = new mongoose.Schema(
  {
    name: {
      type: Number,
      unique: true,
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
  { timestamps: true, collection: 'bangle_sizes' }
);

bangleSizeSchema.pre<IBangleSize>('save', async function (next) {
  if (this.name % 1 !== 0) {
    this.name = parseFloat(this.name.toFixed(1));
  }

  if (this.isModified('is_default') && this.is_default === 'active') {
    const otherDefaultSizes = await BangleSize.find({ is_default: 'active', _id: { $ne: this._id } });

    await Promise.all(
      otherDefaultSizes.map(async (size) => {
        size.is_default = 'inactive';
        await size.save();
      })
    );
  }

  next();
});

const BangleSize: Model<IBangleSize> = mongoose.model('BangleSize', bangleSizeSchema);

export default BangleSize;
