import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../../utils/catchAsyncError';
import ErrorHandler from '../../../utils/errorHandler';
import ProductReview from '../../../models/Product-Master-Models/Product-Review-Models/ProductReviewModel';
import { TStatus } from '../../../@types/commonTypes';
import { TProductReview } from '../../../@types/productTypes';
import { multiFileUpload } from '../../../utils/s3FileUploadClient';

export const getAllReviewByProduct = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getReviewById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await ProductReview.findById(req.params.id);

    if (!review) {
      return next(new ErrorHandler('Review not found', 404));
    }

    return res.status(200).json({ review });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const averageRatingAndTotalUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product_id = req.params.product_id;

    const pipeline = [
      {
        $match: {
          product_id,
        },
      },
      {
        $group: {
          _id: null,
          averageProductRating: { $avg: '$rating' },
          totalNumberOfUserRated: { $sum: 1 },
        },
      },
    ];

    const result = await ProductReview.aggregate(pipeline);

    if (result.length === 0) {
      return res.status(200).json({ message: 'No reviews yet!', averageProductRating: 0, totalNumberOfUserRated: 0 });
    }

    const { averageProductRating, totalNumberOfUserRated } = result[0];
    return res.status(200).json({ averageProductRating, totalNumberOfUserRated });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product_id = req.params.product_id;
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const reviewLike = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await ProductReview.findById(req.params.id);

    if (!review) {
      return next(new ErrorHandler('Review not found', 404));
    }

    if (review.like.includes(req.user?._id)) {
      review.like.splice(review.like.indexOf(req.user?._id), 1);
      await review.save({ validateModifiedOnly: true });
    } else {
      review.like.push(req.user?._id);
      await review.save({ validateModifiedOnly: true });

      if (review.dislike.includes(req.user?._id)) {
        review.dislike.splice(review.dislike.indexOf(req.user?._id), 1);
        await review.save({ validateModifiedOnly: true });
      }
    }

    return res.status(200).json({ message: 'Thanks for voting' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const reviewDislike = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await ProductReview.findById(req.params.id);

    if (!review) {
      return next(new ErrorHandler('Review not found', 404));
    }

    if (review.dislike.includes(req.user?._id)) {
      review.dislike.splice(review.dislike.indexOf(req.user?._id), 1);
      await review.save({ validateModifiedOnly: true });
    } else {
      review.dislike.push(req.user?._id);
      await review.save({ validateModifiedOnly: true });

      if (review.like.includes(req.user?._id)) {
        review.like.splice(review.like.indexOf(req.user?._id), 1);
        await review.save({ validateModifiedOnly: true });
      }
    }

    return res.status(200).json({ message: 'Thanks for voting' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user?._id;
    const files = req.files as Express.Multer.File[];

    //TODO: folder name needs to be changed
    const folderName = 'uploads';

    let uploadedFileUrls: string[] = [];
    const { review_title, rating, review_description } = req.body as TProductReview;
    const review = await ProductReview.findById(req.params.id);

    if (!review) {
      return next(new ErrorHandler('Review not found', 404));
    }

    if (files) {
      uploadedFileUrls = await multiFileUpload(folderName, files);
    }

    if (review.user_id.toString() === user.toString()) {
      review.review_title = review_title || review.review_title;
      review.review_description = review_description || review.review_description;
      review.rating = rating || review.rating;

      if (uploadedFileUrls.length > 0) {
        review.imageUrls = uploadedFileUrls;
      }

      await review.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Review updated successfully!' });
    } else {
      return next(new ErrorHandler('Editing permission denied!', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateReviewStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const review = await ProductReview.findById(req.params.id);

    if (review) {
      review.status = status || review.status;
      await review.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Review status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Review not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const review = await ProductReview.findById(req.params.id);

    if (review) {
      await review.deleteOne();
      return res.status(200).json({ message: ' Review deleted successfully.' });
    } else {
      return next(new ErrorHandler('Review not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
