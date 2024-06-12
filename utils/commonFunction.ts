import crypto from 'crypto';

export const isAlpha = (str: string): boolean => {
  return /^[a-zA-Z0-9&\s-]*$/.test(str) && !/<[^>]*>/.test(str);
};

export const looseDiamondMeasurementCheck = (str: string): boolean => {
  let regex = /^[0-9.x]+$/i;
  return regex.test(str);
};

export const countryCodeCheck = (str: string): boolean => {
  let regex: RegExp = /^\+\d+(-\d+)?$/;
  return regex.test(str);
};

export const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isPincodeString = (str: string): boolean => {
  return /^[0-9]*$/.test(str);
};

export const isUpperCaseString = (str: string): boolean => {
  return /^[A-Z]*$/.test(str);
};

export const arrSpliting = (input: string) => {
  if (typeof input === 'string' && input.trim() !== '') {
    if (/[a-zA-Z\s]/.test(input)) {
      // Split the input string by commas and trim each element
      return input?.split(',').map((item) => item.trim());
    } else {
      // If no letters or spaces are found, assume it's a list of numbers
      // Split the input string by commas, convert each element to a number, and trim if necessary
      return input?.split(',').map((item) => Number(item.trim()));
    }
  } else {
    // Return an empty array or handle the case appropriately based on your requirements
    return [];
  }
};

export const stringSpliting = (input: string) => {
  if (typeof input === 'string' && input.trim() !== '') {
    const stringArr = input?.split(',').map((item) => item.trim());
    return stringArr;
  } else {
    return [];
  }
};

export const generateOtpTimeAndOtp = () => {
  const otp = crypto.randomInt(100000, 999999);
  const otpTime = new Date();
  return { otp, otpTime };
};
