import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Address from '../../models/Account-Master-Models/AddressModel';
import { TAddress, TAddressQueryParams } from '../../@types/accountTypes';

export const getAllAddress = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, country, state, city, isSellerAddress } = req.query as TAddressQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await Address.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (country) {
      query.country = country;
    }

    if (state) {
      query.state = state;
    }

    if (city) {
      query.city = city;
    }

    if (isSellerAddress) {
      query.isSellerAddress = isSellerAddress;
    }

    const allAddresses = await Address.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allAddresses, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAddressById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await Address.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (address) {
      return res.status(200).json({ address });
    } else {
      return next(new ErrorHandler('There is problem while fetching address. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllAddressByUserId = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allAddresses = await Address.find({ user_id: req.user?.id }).select('-createdAt -updatedAt -__v');

    if (allAddresses) {
      return res.status(200).json({ allAddresses });
    } else {
      return next(new ErrorHandler('There is problem while fetching address. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createAddress = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isSellerAddress, country, state, city, addressLine1, addressLine2, pincode, is_default } = req.body as TAddress;

    if (!(country || state || city || pincode || addressLine1)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const address = await Address.create({ user: req.user?.id, isSellerAddress, country, state, city, addressLine1, addressLine2, pincode, is_default });

    if (address) {
      return res.status(201).json({ message: 'Address created' });
    } else {
      return next(new ErrorHandler('There is problem while creating address. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const markAddressIsDefaultByUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAddresses = await Address.find({ user_id: req.user?._id });

    if (userAddresses.length > 0) {
      const addressToMarkDefault = userAddresses.find((address) => address._id.equals(req.params.id));

      if (!addressToMarkDefault) {
        return next(new ErrorHandler('There is problem while marking address as default. Please try after sometime', 400));
      }

      await Address.updateMany({ user_id: req.user?._id, _id: { $ne: req.params.id } }, { $set: { is_default: false } });

      addressToMarkDefault.is_default = req.body.is_default;
      await addressToMarkDefault.save();

      return res.status(200).json({ message: 'Address marked as default.' });
    } else {
      return res.status(200).json({ message: "You haven't added any address" });
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateAddress = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { country, state, city, addressLine1, addressLine2, pincode, is_default } = req.body as TAddress;

    const address = await Address.findById({ _id: req.params.id });

    if (address) {
      address.country = country || address.country;
      address.state = state || address.state;
      address.city = city || address.city;
      address.addressLine1 = addressLine1 || address.addressLine1;
      address.addressLine2 = addressLine2 || address.addressLine2;
      address.pincode = pincode || address.pincode;
      address.is_default = is_default || address.is_default;

      await address.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Address updated.' });
    } else {
      return next(new ErrorHandler('Address not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteAddress = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const address = await Address.findById({ _id: req.params.id });

    if (address) {
      await address.deleteOne();
      return res.status(200).json({ message: 'Address deleted.' });
    } else {
      return next(new ErrorHandler('Address not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
