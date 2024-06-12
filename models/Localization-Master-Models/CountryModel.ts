import mongoose, { Schema, Model, Document } from 'mongoose';
import State from './StateModel';

export interface ICountry extends Document {
  name: string;
  code: string;
  country_code: string;
  status: 'active' | 'inactive';
  totalCarat: number;
  belowCaratCharge: number;
  aboveCaratCharge: number;
  countryImage: string;
}

const countrySchema: Schema<ICountry> = new mongoose.Schema(
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
    country_code: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    totalCarat: {
      type: Number,
      default: 0,
    },
    belowCaratCharge: {
      type: Number,
      default: 0,
    },
    aboveCaratCharge: {
      type: Number,
      default: 0,
    },
    countryImage: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'country',
  }
);

countrySchema.pre<ICountry>('save', function (next) {
  if (!this.isModified('code')) return next();
  let code = this.get('code').trim().toUpperCase();
  this.code = code;
  next();
});

countrySchema.pre<ICountry>('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await State.deleteMany({ country: this.code });
    next();
  } catch (err: any) {
    next(err);
  }
});

const Country: Model<ICountry> = mongoose.model('Country', countrySchema);

export default Country;
