import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { emailRegexPattern } from '../../../utils/commonFunction';
import { IUser } from '../UserModel';

export interface IEmailsList extends Document {
  user_id: Types.ObjectId | IUser;
  email: string;
  email_otp: number;
  email_otpTime: Date;
  isVerified: boolean;
}

const emailListSchema: Schema<IEmailsList> = new mongoose.Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true, 'Please enter your email.'],
    validate: {
      validator: function (value: string) {
        return emailRegexPattern.test(value);
      },
      message: 'Please enter a valid email',
    },
  },
  email_otp: {
    type: Number,
    required: true,
  },
  email_otpTime: {
    type: Date,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const EmailsList: Model<IEmailsList> = mongoose.model('EmailsList', emailListSchema);

export default EmailsList;
