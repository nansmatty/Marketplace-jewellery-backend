import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IUser } from '../UserModel';

export interface IMobileNoList extends Document {
  user_id: Types.ObjectId | IUser;
  m_unique_id: string;
  mobile_number: string;
  mobile_otp: number;
  mobile_otpTime: Date;
  isVerified: boolean;
}

const mobileNoListSchema: Schema<IMobileNoList> = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    m_unique_id: {
      type: String,
      required: true,
    },
    mobile_number: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Please provide your contact info'],
    },
    mobile_otp: {
      type: Number,
      required: true,
    },
    mobile_otpTime: {
      type: Date,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true, collection: 'mobile-no-list' }
);

const MobileNoList: Model<IMobileNoList> = mongoose.model('MobileNoList', mobileNoListSchema);

export default MobileNoList;
