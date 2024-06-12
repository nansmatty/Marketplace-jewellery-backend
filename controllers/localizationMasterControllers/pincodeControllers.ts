import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Pincode from '../../models/Localization-Master-Models/PincodeModel';
import { TLocalizationQueryParams, TPincode } from '../../@types/localizationTypes';
import { TStatus } from '../../@types/commonTypes';
import xlsx from 'xlsx';
import { excelHeadingMatch } from '../../utils/excelHeadingMatch';
import { isPincodeString } from '../../utils/commonFunction';

const excelDataValidationCheck = (excelData: TPincode[]) => {
  const errorsArray: any[] = [];
  let errorChecked = true;

  excelData.forEach((data: TPincode, index: number) => {
    if (typeof data.name !== 'string' || !isPincodeString(data.name)) {
      errorsArray.push({ index, message: `Name must be a non-empty string containing only numeric characters ${index}` });
    }

    if (typeof data.code !== 'string' || !isPincodeString(data.code)) {
      errorsArray.push({ index, message: `Code must be a non-empty string containing only numeric characters ${index}` });
    }

    // Validate is_cod_available (optional)
    if (data.is_cod_available !== undefined && (typeof data.is_cod_available !== 'number' || ![0, 1].includes(data.is_cod_available))) {
      errorsArray.push({ index, message: `is_cod_available must be either 0 or 1 at index ${index}` });
    }

    // Validate deliver_within (optional)
    if (data.deliver_within !== undefined && (typeof data.deliver_within !== 'number' || isNaN(data.deliver_within))) {
      errorsArray.push({ index, message: `Deliver within field must be a valid number at index ${index}` });
    }

    // Validate status (optional)
    if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
      errorsArray.push({ index, message: `Status must be either 'active' or 'inactive' at index ${index}` });
    }
  });

  if (errorsArray.length > 0) {
    errorChecked = false;
    return { errorChecked, errorsArray };
  }

  return { errorChecked, errorsArray };
};

export const getAllPincode = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TLocalizationQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await Pincode.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allPincode = await Pincode.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ allPincode, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getPincodeById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pincode = await Pincode.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (pincode) {
      return res.status(200).json({ pincode });
    } else {
      return next(new ErrorHandler('Pincode not found', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const checkPincodeForAvailablity = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Hiit');

    const pincode = await Pincode.findOne({ code: req.params.pincode });

    if (pincode && pincode.status === 'active') {
      return res.status(200).json({ message: `Deliver within ${pincode.deliver_within} days.` });
    } else {
      // return res.status(200).json({ message: "We don't deliver in this pincode" });
      return next(new ErrorHandler("Sorry! We don't deliver in this pincode.", 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createPincode = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, code, status, deliver_within, is_cod_available } = req.body as TPincode;

    if (!name || !code) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const pincodeExists = await Pincode.findOne({ $or: [{ name }, { code }] });

    if (pincodeExists) {
      return next(new ErrorHandler('Name or Code already exists.', 400));
    }

    const pincode = await Pincode.create({ name, code, status, deliver_within, is_cod_available });

    if (pincode) {
      return res.status(201).json({ message: 'Pincode created' });
    } else {
      return next(new ErrorHandler('There is problem while creating pincode. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const bulkPincodeDataUpload = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const skippedItemIds: number[] = [];
    const file = req.file;
    if (!file) {
      return next(new ErrorHandler('No files are uploaded', 400));
    }

    //file buffering
    const pincodeWorkboook = xlsx.read(file.buffer);

    //mongodb schema fields headings
    const pincodeSchemaFields = Object.keys(Pincode.schema.obj);

    const { headingsMatch, excelDataConvertIntoJsonData: jsonData } = excelHeadingMatch(pincodeWorkboook, pincodeSchemaFields);

    if (!headingsMatch) {
      return next(new ErrorHandler('Excel headings do not match expected fields', 400));
    }

    const isValid = excelDataValidationCheck(jsonData);

    if (!isValid.errorChecked) {
      return next(new ErrorHandler(`Invalid loose diamond rate data format`, 400));
    }

    //Process jsonData and add in database
    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];

      const existingPincode = await Pincode.findOne({ $or: [{ name: item.name }, { code: item.code }] });

      if (existingPincode) {
        existingPincode.name = item.name || existingPincode.name;
        existingPincode.code = item.code || existingPincode.code;
        existingPincode.deliver_within = item.deliver_within || existingPincode.deliver_within;
        existingPincode.is_cod_available = item.is_cod_available || existingPincode.is_cod_available;
        existingPincode.status = item.status || existingPincode.status;

        existingPincode.save({ validateModifiedOnly: true });
      } else {
        await Pincode.create(item);
      }
    }

    res.json({ success: true, message: 'Data uploaded successfully' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updatePincode = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status, deliver_within, is_cod_available } = req.body as TPincode;

    const pincode = await Pincode.findById({ _id: req.params.id });

    if (pincode) {
      pincode.name = name || pincode.name;
      pincode.deliver_within = deliver_within || pincode.deliver_within;
      pincode.is_cod_available = is_cod_available || pincode.is_cod_available;
      pincode.status = status || pincode.status;

      await pincode.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Pincode updated.' });
    } else {
      return next(new ErrorHandler('Pincode not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updatePincodeStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const pincode = await Pincode.findById({ _id: req.params.id });

    if (pincode) {
      pincode.status = status || pincode.status;
      await pincode.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Pincode status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Pincode not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deletePincode = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pincode = await Pincode.findById({ _id: req.params.id });

    if (pincode) {
      await pincode.deleteOne();
      return res.status(200).json({ message: 'Pincode deleted.' });
    } else {
      return next(new ErrorHandler('Pincode not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
