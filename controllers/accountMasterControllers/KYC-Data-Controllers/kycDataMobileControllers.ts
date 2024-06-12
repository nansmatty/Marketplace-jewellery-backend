import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../../utils/catchAsyncError';
import ErrorHandler from '../../../utils/errorHandler';
import { TKYCDataMobile } from '../../../@types/accountTypes';
import crypto from 'crypto';
import MobileNoList from '../../../models/Account-Master-Models/KYC-Data-Model/KYCDataMobileModel';
import smsMessage from '../../../utils/twilioClient';
import { uuid } from 'uuidv4';
import { ITokenOptions } from '../../../@types/userTypes';
import { generateOtpTimeAndOtp } from '../../../utils/commonFunction';

export const getAllMobileByUserId = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user?._id;

    const mobileNos = await MobileNoList.find({ user_id });

    if (mobileNos.length === 0) {
      return res.status(200).json({ message: "You haven't added any mobile no." });
    }

    return res.status(200).json({ mobileNos });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const addNewMobile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mobile_number, country_code } = req.body as TKYCDataMobile;

    if (!(mobile_number || country_code)) {
      return next(new ErrorHandler('Please fill all the fields', 400));
    }

    const m_unique_id: string = uuid();

    const mergedMobile = country_code + mobile_number;
    const { otp, otpTime } = generateOtpTimeAndOtp();

    const createData = await MobileNoList.create({ user_id: req.user?._id, m_unique_id, mobile_number: mergedMobile, mobile_otp: otp, mobile_otpTime: otpTime });

    if (createData) {
      let message = `${otp} is your one time password to proceed on Jewellerskart Marketplace. It is valid for ${process.env.OTP_TIME} minutes. Do not share your OTP with anyone`;

      await smsMessage(mergedMobile, message);

      const cookieOption: ITokenOptions = {
        httpOnly: true,
        sameSite: 'lax',
      };

      return res.status(200).cookie('m_unique_id', m_unique_id, cookieOption).json({
        message: 'OTP (One time password) has been sent to your mobile number',
      });
    } else {
      return next(new ErrorHandler('There is a problem in the server. Please try after sometime.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const verifyMobileNo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const otp = req.body.otp;
    const m_unique_id = req.cookies.m_unique_id;
    const user_id = req.user?.id;

    const current_time = new Date().getTime();
    const minutes = Number(process.env.OTP_TIME) || 10;

    const getMobileNo = await MobileNoList.findOne({ $and: [user_id, m_unique_id] });

    if (!getMobileNo) {
      return next(new ErrorHandler('Mobile No. not found', 404));
    }

    const mobileOtpTime = new Date(getMobileNo.mobile_otpTime).getTime();
    const timeDiffernce = current_time - mobileOtpTime;

    if (timeDiffernce > minutes * 60 * 1000) {
      return next(new ErrorHandler('OTP Expired! Generate a new one', 400));
    }

    if (getMobileNo.mobile_otp !== Number(otp)) {
      return next(new ErrorHandler('Please enter a valid OTP', 400));
    }

    getMobileNo.isVerified = true;
    await getMobileNo.save({ validateModifiedOnly: true });

    //TODO: SMS and Email to user for registration success

    return res.status(200).clearCookie('m_unique_id').json({ message: 'Verification Success!' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const resendOTP = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const m_unique_id = req.cookies.m_unique_id;
    const { otp, otpTime } = generateOtpTimeAndOtp();

    const getMobileNo = await MobileNoList.findOne({ $and: [{ user_id: req.user?._id }, m_unique_id] });

    if (!getMobileNo) {
      return next(new ErrorHandler('Mobile No. not found', 404));
    }

    getMobileNo.mobile_otp = otp;
    getMobileNo.mobile_otpTime = otpTime;

    await getMobileNo.save({ validateModifiedOnly: true });
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteMobileNo = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //TODO: List through check if the there is only one no. then not allowed to delete

    const getMobileNo = await MobileNoList.findOne({ $and: [{ user_id: req.user?._id }, { _id: req.params.id }] });

    if (getMobileNo) {
      await getMobileNo.deleteOne();

      res.status(200).json({ message: 'Mobile no. deleted' });
    } else {
      return next(new ErrorHandler('Mobile No. not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
