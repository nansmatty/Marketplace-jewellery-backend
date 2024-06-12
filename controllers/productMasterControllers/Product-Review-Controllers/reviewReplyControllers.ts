import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../../utils/catchAsyncError';
import ErrorHandler from '../../../utils/errorHandler';
import ReviewReply from '../../../models/Product-Master-Models/Product-Review-Models/ProductReviewReplyModel';

export const addReplyOnReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const reviewReplyLike = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new ErrorHandler('Review not found', 404));
    }

    if (reply.like.includes(req.user?._id)) {
      reply.like.splice(reply.like.indexOf(req.user?._id), 1);
      await reply.save({ validateModifiedOnly: true });
    } else {
      reply.like.push(req.user?._id);
      await reply.save({ validateModifiedOnly: true });

      if (reply.dislike.includes(req.user?._id)) {
        reply.dislike.splice(reply.dislike.indexOf(req.user?._id), 1);
        await reply.save({ validateModifiedOnly: true });
      }
    }

    return res.status(200).json({ message: 'Thanks for voting' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const reviewReplyDislike = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reply = await ReviewReply.findById(req.params.id);

    if (!reply) {
      return next(new ErrorHandler('Review not found', 404));
    }

    if (reply.dislike.includes(req.user?._id)) {
      reply.dislike.splice(reply.dislike.indexOf(req.user?._id), 1);
      await reply.save({ validateModifiedOnly: true });
    } else {
      reply.dislike.push(req.user?._id);
      await reply.save({ validateModifiedOnly: true });

      if (reply.like.includes(req.user?._id)) {
        reply.like.splice(reply.like.indexOf(req.user?._id), 1);
        await reply.save({ validateModifiedOnly: true });
      }
    }

    return res.status(200).json({ message: 'Thanks for voting' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateReviewReply = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateReviewReplyStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteReviewReply = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
