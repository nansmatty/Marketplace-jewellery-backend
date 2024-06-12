import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { uuid } from 'uuidv4';
import { ITokenOptions, TResetToken, TUpdatePassword, TUserEmailBody, TUserLoginBody, TUserNameBody, TUserPasswordBody, TUserRegisterBody } from '../../@types/userTypes';
import User, { IUser } from '../../models/Account-Master-Models/UserModel';
import ErrorHandler from '../../utils/errorHandler';
import CatchAsyncError from '../../utils/catchAsyncError';
import { sendToken } from '../../utils/jsonwebtoken';
import { redis } from '../../config/redis';
import { generateOtpTimeAndOtp } from '../../utils/commonFunction';

const generateResetPasswordLinkAndTime = () => {
  const resetToken = crypto.randomBytes(40).toString('hex');
  const token = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiryTime = new Date();
  return { token, expiryTime };
};

export const getUserData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({ user });
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const register = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, mobile_number, country_code } = req.body as TUserRegisterBody;

    if (!(name || email || password || mobile_number || country_code)) {
      return next(new ErrorHandler('Please fill all the details', 400));
    }

    const mergedMobile = country_code + mobile_number;

    const emailEdited = email.trim().toLowerCase();

    const isEmailExist = await User.findOne({ $or: [{ email: emailEdited }, { mobile_number: mergedMobile }] });

    if (isEmailExist) {
      return next(new ErrorHandler('User with same email or mobile number already exists.', 409));
    }

    const user_unique_id: string = uuid();
    const { otp, otpTime } = generateOtpTimeAndOtp();

    const user = await User.create({
      user_unique_id,
      name,
      email,
      mobile_number: mergedMobile,
      password,
      otp,
      otpTime,
    });

    const createdUser = await User.findById(user._id).select('-password');

    if (!createdUser) {
      return next(new ErrorHandler('Something went wrong while registering the user', 500));
    }

    //TODO: SMS and Email service add to send the otp to user

    const cookieOption: ITokenOptions = {
      httpOnly: true,
      sameSite: 'lax',
    };

    return res.status(201).cookie('user_unique_id', user_unique_id, cookieOption).json({
      success: true,
      message: 'OTP (One time password) has been sent to your mobile number',
    });
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const verify_user = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp } = req.body;
    const user_unique_id = req.cookies.user_unique_id;

    const current_time = new Date().getTime();
    const minutes = Number(process.env.OTP_TIME) || 10;

    const user = await User.findOne({ user_unique_id });

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    const userOtpTime = new Date(user.otpTime).getTime();
    const timeDiffernce = current_time - userOtpTime;

    if (timeDiffernce > minutes * 60 * 1000) {
      return next(new ErrorHandler('OTP Expired! Generate a new one', 400));
    }

    if (user.otp !== Number(otp)) {
      return next(new ErrorHandler('Please enter a valid OTP', 400));
    }

    user.isVerified = true;
    await user.save({ validateModifiedOnly: true });

    //TODO: SMS and Email to user for registration success

    return res.clearCookie('user_unique_id').json({ message: 'Verification Success! User can login now' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const resend_otp = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user_unique_id = req.cookies.user_unique_id;
    const { otp, otpTime } = generateOtpTimeAndOtp();
    const user = await User.findOne({ user_unique_id });
    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    user.otp = otp;
    user.otpTime = otpTime;
    await user.save({ validateModifiedOnly: true });

    //TODO: SMS and EMAIL Config to sent the verification code

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const login = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as TUserLoginBody;

    if (!(email || password)) {
      return next(new ErrorHandler('Please enter email and password', 400));
    }

    const emailEdited = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailEdited }).select('password');

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return next(new ErrorHandler('Invalid Credentials', 401));
    }

    const loggedInUser: IUser = await User.findById(user._id).select('-password');

    sendToken(loggedInUser, 200, res);
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const forgot_password = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body as TUserEmailBody;

    if (!email) {
      return next(new ErrorHandler('Please enter the registered email.', 400));
    }

    const emailEdited = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailEdited });

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    const { token, expiryTime } = generateResetPasswordLinkAndTime();
    const link = `${process.env.BASE_URL}/reset-password/${token}`;

    user.resetPasswordToken = token;
    user.resetPasswordExpiry = expiryTime;
    await user.save({ validateModifiedOnly: true });

    //TODO: EMAIL the token with url added

    res.json({ link, message: 'Reset password link has been sent to your mail.' });
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const reset_password = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken } = req.params as TResetToken;
    const { password } = req.body as TUserPasswordBody;
    const current_time = new Date().getTime();
    const minutes = Number(process.env.RESET_LINK_TIME) || 5;

    const user = await User.findOne({ resetPasswordToken: resetToken });

    if (!user) {
      return next(new ErrorHandler('Invalid token!', 400));
    }

    if (user.resetPasswordToken !== resetToken) {
      return next(new ErrorHandler('Invalid token! Please generate again.', 400));
    }

    const resetExpiryTime = new Date(user.resetPasswordExpiry).getTime();
    const timeDiffernce = current_time - resetExpiryTime;

    if (timeDiffernce > minutes * 60 * 1000) {
      return next(new ErrorHandler('Token Expired! Please generate a new one', 400));
    }
    user.password = password;
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const update_password = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { old_password, password } = req.body as TUpdatePassword;

    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    const isPasswordValid = await user.isPasswordCorrect(old_password);

    if (!isPasswordValid) {
      return next(new ErrorHandler("Old Password didn't match", 400));
    }

    user.password = password;
    await user.save();

    return res.json({ message: 'Password Updated Successfully' });
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const update_user_profile = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body as TUserNameBody;

    if (!name) {
      return next(new ErrorHandler('Name is required', 400));
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    user.name = name;
    await user.save({ validateModifiedOnly: true });

    return res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});

export const logoutUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    redis.del(req.user?._id);

    res
      .clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false,
      })
      .json({ message: 'Logout successfully' });
  } catch (error) {
    return next(new ErrorHandler('Something went wrong. Please try after sometime.', 500));
  }
});
