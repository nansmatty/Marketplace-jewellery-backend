import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRingSizes extends Document {
  name: number;
  code: number;
  status: 'active' | 'inactive';
  description: string;
  is_default: 'active' | 'inactive';
}

const ringSizeSchema: Schema<IRingSizes> = new mongoose.Schema(
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
  { timestamps: true, collection: 'ring_sizes' }
);

ringSizeSchema.pre<IRingSizes>('save', async function (next) {
  if (this.isModified('is_default') && this.is_default === 'active') {
    const otherDefaultSizes = await RingSizes.find({ is_default: 'active', _id: { $ne: this._id } });

    await Promise.all(
      otherDefaultSizes.map(async (size) => {
        size.is_default = 'inactive';
        await size.save();
      })
    );
  }

  next();
});

const RingSizes: Model<IRingSizes> = mongoose.model('RingSizes', ringSizeSchema);

export default RingSizes;
