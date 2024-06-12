require('dotenv').config();
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IRoles } from './RolesModel';
import { emailRegexPattern } from '../../utils/commonFunction';
import { IKYCData } from './KYC-Data-Model/KYCDataModel';

export interface IUser extends Document {
  user_unique_id: string;
  name: string;
  email: string;
  mobile_number: string;
  password: string;
  isVerified: boolean;
  otp: number;
  otpTime: Date;
  resetPasswordToken: string;
  resetPasswordExpiry: Date;
  role_id: Types.ObjectId | IRoles;
  kyc_id: Types.ObjectId | IKYCData;
  isAppliedForSeller: boolean;
  isVerifiedSeller: boolean;
  isPasswordCorrect: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    user_unique_id: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please enter your name.'],
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
    mobile_number: {
      type: String,
      unique: true,
      trim: true,
      required: [true, 'Please provide your contact info'],
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [6, 'Password must be least 6 characters'],
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    otp: {
      type: Number,
      required: true,
    },
    otpTime: {
      type: Date,
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    role_id: {
      type: Schema.Types.ObjectId,
      ref: 'Roles',
    },
    kyc_id: {
      type: Schema.Types.ObjectId,
      ref: 'KYCData',
    },
    isAppliedForSeller: {
      type: Boolean,
      default: false,
    },
    isVerifiedSeller: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET || ''
  );
};

const User: Model<IUser> = mongoose.model('User', userSchema);

export default User;
