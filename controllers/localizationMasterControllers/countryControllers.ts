import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Country from '../../models/Localization-Master-Models/CountryModel';
import { TLocalizationQueryParams, TCountry, ICountryWithImage } from '../../@types/localizationTypes';
import { TStatus } from '../../@types/commonTypes';
import xlsx from 'xlsx';
import { excelHeadingMatch } from '../../utils/excelHeadingMatch';
import { countryCodeCheck, isAlpha } from '../../utils/commonFunction';
import { getObjectURL, putParams, s3Client } from '../../utils/s3FileUploadClient';
import { PutObjectCommand } from '@aws-sdk/client-s3';

const excelDataValidationCheck = (excelData: TCountry[]) => {
  const errorsArray: any[] = [];
  let errorChecked = true;

  excelData.forEach((data: TCountry, index: number) => {
    if (typeof data.name !== 'string' || !isAlpha(data.name)) {
      errorsArray.push({ index, message: `Name must be a non-empty string containing only alphanumeric characters ${index}` });
    }

    if (typeof data.code !== 'string' || !isAlpha(data.code)) {
      errorsArray.push({ index, message: `Code must be a non-empty string containing only alphanumeric characters ${index}` });
    }

    if (typeof data.country_code !== 'string' || !countryCodeCheck(data.country_code)) {
      errorsArray.push({ index, message: `Code must be a non-empty string containing only alphanumeric characters ${index}` });
    }

    if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
      errorsArray.push({ index, message: `Status must be either 'active' or 'inactive' at index ${index}` });
    }

    if (data.totalCarat !== undefined && (typeof data.totalCarat !== 'number' || isNaN(data.totalCarat))) {
      errorsArray.push({ index, message: `Total carat charge must be valid number at index ${index}` });
    }

    if (data.belowCaratCharge !== undefined && (typeof data.belowCaratCharge !== 'number' || isNaN(data.belowCaratCharge))) {
      errorsArray.push({ index, message: `Below carat charge must be valid number at index ${index}` });
    }

    if (data.aboveCaratCharge !== undefined && (typeof data.aboveCaratCharge !== 'number' || isNaN(data.aboveCaratCharge))) {
      errorsArray.push({ index, message: `Above carat charge must be valid number at index ${index}` });
    }
  });

  if (errorsArray.length > 0) {
    errorChecked = false;
    return { errorChecked, errorsArray };
  }

  return { errorChecked, errorsArray };
};

export const getAllCountry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageNumber, pageSize, name, status } = req.query as TLocalizationQueryParams;
    const page = Number(pageNumber) || 1;
    const sizeOfPage = Number(pageSize) || 10;

    let query: any = {};
    const count = await Country.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    if (status) {
      query.status = status;
    }

    if (name) {
      query.name = new RegExp(name, 'i');
    }

    const allCountries = await Country.find(query).limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');
    4;

    const countriesWithImages = await Promise.all(
      allCountries.map(async (country) => {
        if (country.countryImage) {
          const imageUrl = await getObjectURL('country', country.countryImage);
          return { ...country.toJSON(), imageUrl };
        } else {
          return country.toJSON(); // If no image, return country object as is
        }
      })
    );
    return res.status(200).json({ allCountries: countriesWithImages, pages, page });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getCountryById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const country = await Country.findById({ _id: req.params.id }).select('-createdAt -updatedAt -__v');

    if (!country) {
      return next(new ErrorHandler('Country not found', 404));
    }

    let countryDataWithImage = country.toJSON() as ICountryWithImage; // Convert country to JSON

    if (country.countryImage) {
      let imageUrl = await getObjectURL('country', country.countryImage);
      if (typeof imageUrl === 'string') {
        countryDataWithImage.imageUrl = imageUrl; // Include imageUrl in country object
      } else {
        return next(new ErrorHandler('Error fetching image URL', 500)); // Handle error
      }
    }

    return res.status(200).json({ country: countryDataWithImage });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const getAllCountryBasedStatusActive = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const countries = await Country.find({ status: 'active' });

    if (countries) {
      return res.status(200).json({ countries });
    } else {
      return next(new ErrorHandler('There is problem while trying to fetching countries list. Please try after sometime', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createCountry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    let countryImage;
    const folderName = 'country';

    const { name, code, status, country_code, totalCarat, belowCaratCharge, aboveCaratCharge } = req.body as TCountry;
    const file = req.file as Express.Multer.File;

    if (!(name || code || country_code)) {
      return next(new ErrorHandler('Please fill the required fields.', 400));
    }

    const countryExists = await Country.findOne({ $or: [{ name }, { code }, { country_code }] });

    if (countryExists) {
      return next(new ErrorHandler('Name or Code or Country Code already exists.', 400));
    }

    // File Uploading if there is a file
    if (file) {
      countryImage = file.originalname;
      await s3Client.send(new PutObjectCommand(putParams(countryImage, folderName, file.buffer, file.mimetype)));
    }

    const country = await Country.create({ name, code, status, country_code, totalCarat, belowCaratCharge, aboveCaratCharge, countryImage });

    if (country) {
      return res.status(201).json({ message: 'Country created' });
    } else {
      return next(new ErrorHandler('There is problem while creating country. Please try after sometime', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const bulkCountryDataUpload = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const skippedItemIds: number[] = [];
    const file = req.file;
    if (!file) {
      return next(new ErrorHandler('No files are uploaded', 400));
    }

    //file buffering
    const countryWorkboook = xlsx.read(file.buffer);

    //mongodb schema fields headings
    const countrySchemaFields = Object.keys(Country.schema.obj);

    const { headingsMatch, excelDataConvertIntoJsonData: jsonData } = excelHeadingMatch(countryWorkboook, countrySchemaFields);

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

      const existingCountry = await Country.findOne({ $or: [{ name: item.name }, { code: item.code }] });

      if (existingCountry) {
        existingCountry.status = item.status || existingCountry.status;
        existingCountry.country_code = item.country_code || existingCountry.country_code;
        existingCountry.totalCarat = item.totalCarat || existingCountry.totalCarat;
        existingCountry.belowCaratCharge = item.belowCaratCharge || existingCountry.belowCaratCharge;
        existingCountry.aboveCaratCharge = item.aboveCaratCharge || existingCountry.aboveCaratCharge;

        existingCountry.save({ validateModifiedOnly: true });
      } else {
        await Country.create(item);
      }
    }

    res.json({ success: true, message: 'Data uploaded successfully' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCountry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    let countryImage;
    const folderName = 'country';
    const { name, status, code, country_code, totalCarat, aboveCaratCharge, belowCaratCharge } = req.body as TCountry;
    const file = req.file as Express.Multer.File;

    // File Uploading if there is a file
    if (file) {
      countryImage = file.originalname;
      await s3Client.send(new PutObjectCommand(putParams(countryImage, folderName, file.buffer, file.mimetype)));
    }

    const country = await Country.findById({ _id: req.params.id });

    if (country) {
      country.name = name || country.name;
      country.code = code || country.code;
      country.status = status || country.status;
      country.country_code = country_code || country.country_code;
      country.totalCarat = totalCarat || country.totalCarat;
      country.aboveCaratCharge = aboveCaratCharge || country.aboveCaratCharge;
      country.belowCaratCharge = belowCaratCharge || country.belowCaratCharge;
      country.countryImage = countryImage || country.countryImage;

      await country.save({ validateModifiedOnly: true });
      return res.status(200).json({ message: 'Country updated.' });
    } else {
      return next(new ErrorHandler('Country not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateCountryStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as TStatus;

    const country = await Country.findById({ _id: req.params.id });

    if (country) {
      country.status = status || country.status;

      await country.save({ validateModifiedOnly: true });

      return res.status(200).json({ message: `Country status has been ${status === 'active' ? 'activated' : 'deactivated'} successfully.` });
    } else {
      return next(new ErrorHandler('Country not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const deleteCountry = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const country = await Country.findById({ _id: req.params.id });

    if (country) {
      await country.deleteOne();
      return res.status(200).json({ message: 'Country deleted.' });
    } else {
      return next(new ErrorHandler('Country not found.', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
