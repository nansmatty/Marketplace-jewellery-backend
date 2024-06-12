import mongoose, { Model, Schema } from 'mongoose';
import { ISolitare } from '../../@types/solitareTypes';

const solitareLabsSchema: Schema<ISolitare> = new mongoose.Schema(
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
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      required: true,
    },
    is_default: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
  },
  { timestamps: true, collection: 'solitare_labs' }
);

solitareLabsSchema.pre<ISolitare>('save', async function (next) {
  if (this.isModified('is_default') && this.is_default === 'active') {
    const otherDefaults = await SolitareLabs.find({ is_default: 'active', _id: { $ne: this._id } });

    await Promise.all(
      otherDefaults.map(async (od) => {
        od.is_default = 'inactive';
        await od.save();
      })
    );
  }

  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const SolitareLabs: Model<ISolitare> = mongoose.model('SolitareLabs', solitareLabsSchema);

export default SolitareLabs;
