import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IAddress } from '../AddressModel';
import { IUser } from '../UserModel';
import { IEmailsList } from './KYCDataEmailModel';
import { IMobileNoList } from './KYCDataMobileModel';

export interface IKYCData extends Document {
  user_id: Types.ObjectId | IUser;
  gst: string;
  company_type: 'INDIVIDUAL' | 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLP' | 'PRIVATE LIMITED' | 'PUBLIC LIMITED' | 'HUF';
  company_name: string;
  company_url: string;
  company_pan_card: string;
  individual_pan_card: string;
  company_address: Types.ObjectId[] | IAddress[];
  company_emails: Types.ObjectId[] | IEmailsList[];
  company_mobile_no: Types.ObjectId[] | IMobileNoList[];
  banker_name: string;
  account_no: string;
  ifsc_code: string;
  isDataVerified: boolean;
  //File Upload ---------------------------------------------------------------------
  company_logo: string;
  gst_file: string;
  pan_card_file: string;
}

const kycDataSchema: Schema<IKYCData> = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gst: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    company_type: {
      type: String,
      enum: ['INDIVIDUAL', 'PROPRIETORSHIP', 'PARTNERSHIP', 'LLP', 'PRIVATE LIMITED', 'PUBLIC LIMITED', 'HUF'],
      required: true,
    },
    company_name: {
      type: String,
      trim: true,
      required: true,
    },
    company_url: {
      type: String,
      trim: true,
      required: true,
    },
    company_pan_card: {
      type: String,
      trim: true,
      required: true,
    },
    company_address: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
      },
    ],
    company_emails: [
      {
        type: Schema.Types.ObjectId,
        ref: 'EmailsList',
      },
    ],
    company_mobile_no: [
      {
        type: Schema.Types.ObjectId,
        ref: 'MobileNoList',
        required: true,
      },
    ],
    banker_name: {
      type: String,
      trim: true,
      uppercase: true,
      required: true,
    },
    ifsc_code: {
      type: String,
      trim: true,
      required: true,
    },
    account_no: {
      type: String,
      trim: true,
      required: true,
    },

    isDataVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    company_logo: {
      type: String,
      required: true,
    },
    gst_file: {
      type: String,
      required: true,
    },
    pan_card_file: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'kyc_data',
  }
);

const KYCData: Model<IKYCData> = mongoose.model('KYCData', kycDataSchema);

export default KYCData;
