import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TProductEnquiry } from '../../@types/productTypes';
import ProductEnquiry from '../../models/Product-Master-Models/ProductEnquiryModel';
import { TQueryParams } from '../../@types/commonTypes';

export const getAllEnquiries = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    const count = await ProductEnquiry.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    const allEnquiries = await ProductEnquiry.find().limit(sizeOfPage).skip(skipDoc).select('-updatedAt -__v');

    return res.status(200).json({ allEnquiries, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllEnquiriesBasedOnSellerId = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seller_id = req.user?._id;
    
    const { pageSize, pageNumber } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    const count = await ProductEnquiry.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    const allEnquiries = await ProductEnquiry.find({seller_id}).limit(sizeOfPage).skip(skipDoc).select('-updatedAt -__v -seller_id');

    return res.status(200).json({ allEnquiries, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllEnquiryById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enquiryData = await ProductEnquiry.findById(req.params.id);

    if (!enquiryData) {
      return next(new ErrorHandler('Enquiry data not found', 400));
    } else {
      return res.status(200).json({ enquiryData });
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const sendProductEnquiry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, mobile_number, enquiry_message, product_id } = req.body as TProductEnquiry;

    if (!(name || email || enquiry_message)) {
      return next(new ErrorHandler('Please fill the required fields', 400));
    }

    const enquiryData = await ProductEnquiry.create({
      name,
      email,
      mobile_number,
      enquiry_message,
      product_id,
    });

    if (enquiryData) {
      return res.status(201).json({ message: 'Enquiry request sent successfully!' });
    } else {
      return next(new ErrorHandler('There is problem while sending the product enquiry. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const markRepliedOrResolvedEnquiry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enquiryData = await ProductEnquiry.findById(req.params.id);

    if (enquiryData) {
      enquiryData.repliedOrResolved = req.body.repliedOrResolved || enquiryData.repliedOrResolved;

      await enquiryData.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Enquiry data marked as ${req.body.repliedOrResolve ? 'resolved' : 'unresolved'}` });
    } else {
      return next(new ErrorHandler('Enquiry data not found', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteEnquiry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enquiryData = await ProductEnquiry.findById(req.params.id);

    if (enquiryData) {
      await enquiryData.deleteOne();
      return res.status(200).json({ message: `Enquiry data has been deleted successfully!` });
    } else {
      return next(new ErrorHandler('Enquiry data not found', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
