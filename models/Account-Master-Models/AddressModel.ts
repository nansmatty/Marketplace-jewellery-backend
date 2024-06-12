import mongoose, { Types, Schema, Document, Model } from 'mongoose';
import { IUser } from './UserModel';
import ErrorHandler from '../../utils/errorHandler';

export interface IAddress extends Document {
  user_id: Types.ObjectId | IUser;
  isSellerAddress: boolean;
  country: string;
  state: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  is_default: boolean;
}

const addressSchema: Schema<IAddress> = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isSellerAddress: {
    type: Boolean,
    default: false,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
  },
  pincode: {
    type: String,
    required: true,
  },
  is_default: {
    type: Boolean,
    default: false,
  },
});

addressSchema.pre<IAddress>('save', async function (next) {
  try {
    const country = await mongoose.model('Country').findById(this.country);

    if (!country || country.status === 'inactive') {
      return next(new ErrorHandler("Sorry, We don't deliver in this region.", 400));
    }

    const state = await mongoose.model('State').findById(this.state);

    if (!state || state.status === 'inactive') {
      return next(new ErrorHandler("Sorry, We don't deliver in this region.", 400));
    }

    const city = await mongoose.model('City').findById(this.city);

    if (!city || city.status === 'inactive') {
      return next(new ErrorHandler("Sorry, We don't deliver in this region.", 400));
    }

    const pincode = await mongoose.model('Pincode').findById(this.pincode);

    if (!pincode || pincode.status === 'inactive') {
      return next(new ErrorHandler("Sorry, We don't deliver in this region.", 400));
    }

    // if (this.isModified('is_default') && this.is_default) {
    //   const otherDefaultAddress = await Address.find({ is_default: true, _id: { $ne: this._id } });

    //   await Promise.all(
    //     otherDefaultAddress.map(async (address) => {
    //       address.is_default = false;
    //       await address.save();
    //     })
    //   );
    // }

    next();
  } catch (error: any) {
    next(error);
  }
});

const Address: Model<IAddress> = mongoose.model('Address', addressSchema);

export default Address;
