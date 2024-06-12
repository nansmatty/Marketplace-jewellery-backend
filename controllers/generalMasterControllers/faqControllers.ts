import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Faq from '../../models/General-Master-Models/FaqModel';
import { TStatus } from '../../@types/commonTypes';
import { TFaq, TFaqQueryParams } from '../../@types/generalTypes';

export const getAllFaq = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, question, status } = req.query as TFaqQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await Faq.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (question) {
      query.question = new RegExp(question, 'i');
    }
    const allFaqs = await Faq.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allFaqs, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getFaqById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faq = await Faq.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (faq) {
      return res.status(200).json({ faq });
    } else {
      return next(new ErrorHandler('There is problem while fetching faq. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllFaqByStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faqs = await Faq.find({ status: 'active' }).select('-createdAt -updatedAt -__v');

    if (faqs) {
      return res.status(200).json({ faqs });
    } else {
      return next(new ErrorHandler('There is problem while fetching faq. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createFaq = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, status, description } = req.body as TFaq;

    if (!(question || description)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const faq = await Faq.create({ question, status, description });

    if (faq) {
      return res.status(201).json({ message: 'Faq created' });
    } else {
      return next(new ErrorHandler('There is problem while creating faq. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateFaq = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, status, description } = req.body as TFaq;

    const faq = await Faq.findById({ _id: req.params.id });

    if (faq) {
      faq.question = question || faq.question;
      faq.description = description || faq.description;
      faq.status = status || faq.status;

      await faq.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Faq updated.' });
    } else {
      return next(new ErrorHandler('Faq not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateFaqStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const faq = await Faq.findById({ _id: req.params.id });

    if (faq) {
      faq.status = status || faq.status;

      await faq.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: `Faq status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Faq not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

//FIXME:  TODO: Before deleting any faq add a checking through products and metal type if that metal price is not used any product or metal type then you can only delete that metal price

export const deleteFaq = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const faq = await Faq.findById({ _id: req.params.id });

    if (faq) {
      await faq.deleteOne();
      return res.status(200).json({ message: 'Faq deleted.' });
    } else {
      return next(new ErrorHandler('Faq not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
