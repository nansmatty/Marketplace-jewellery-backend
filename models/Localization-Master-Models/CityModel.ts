import mongoose, { Schema, Model, Document } from 'mongoose';
import ErrorHandler from '../../utils/errorHandler';

export interface ICity extends Document {
  name: string;
  code: string;
  state: string;
  status: 'active' | 'inactive';
}

const citySchema: Schema<ICity> = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    state: {
      type: String,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    collection: 'city',
  }
);

citySchema.pre<ICity>('save', async function (next) {
  const state = await mongoose.model('State').findOne({ code: this.state });

  if (!state) {
    return next(new ErrorHandler('State not found', 404));
  }

  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

const City: Model<ICity> = mongoose.model('City', citySchema);

export default City;
