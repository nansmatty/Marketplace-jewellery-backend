import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../../utils/catchAsyncError';
import ErrorHandler from '../../../utils/errorHandler';
import { multiFileUpload } from '../../../utils/s3FileUploadClient';

export const fileIUploadTest = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    const folderName = 'uploads';
    const uploadedFileUrls: string[] = await multiFileUpload(folderName, files);

    return res.status(200).json({ message: 'Files uploaded successfully', uploadedFileUrls });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
