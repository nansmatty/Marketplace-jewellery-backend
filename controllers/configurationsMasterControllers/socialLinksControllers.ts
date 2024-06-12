import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import SocialLinks, { ISocialLinks } from '../../models/Configuration-Master-Models/SocialLinksModel';

export const getSocialLinksById = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    //TODO: Change the enviroment variable to actual id after creating the data.
    const configId = process.env.SOCIAL_LINKS_ID as string;
    const socialLinksData = await SocialLinks.findById(configId);

    if (!socialLinksData) {
      return next(new ErrorHandler('Social links data not found', 404));
    }

    return res.status(200).json({ socialLinksData });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const createSocialLinks = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { linkedInLink, twitterLink, instagramLink, youtubeLink, facebookLink, whatsappNo, pinterestLink } = req.body as ISocialLinks;

    const socialLinks = await SocialLinks.create({
      linkedInLink,
      twitterLink,
      instagramLink,
      youtubeLink,
      facebookLink,
      whatsappNo,
      pinterestLink,
    });

    if (socialLinks) {
      return res.status(201).json({ message: 'Social links created successfully' });
    } else {
      return next(new ErrorHandler('There is a problem while creating the rate configuration data. Please try after sometimes.', 400));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const updateSocialLinks = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { linkedInLink, twitterLink, instagramLink, youtubeLink, facebookLink, whatsappNo, pinterestLink } = req.body as ISocialLinks;
    //TODO: Change the enviroment variable to actual id after creating the data.
    const configId = process.env.SOCIAL_LINKS_ID as string;
    const socialLinksData = await SocialLinks.findById(configId);

    if (socialLinksData) {
      socialLinksData.linkedInLink = linkedInLink || socialLinksData.linkedInLink;
      socialLinksData.twitterLink = twitterLink || socialLinksData.twitterLink;
      socialLinksData.instagramLink = instagramLink || socialLinksData.instagramLink;
      socialLinksData.youtubeLink = youtubeLink || socialLinksData.youtubeLink;
      socialLinksData.facebookLink = facebookLink || socialLinksData.facebookLink;
      socialLinksData.whatsappNo = whatsappNo || socialLinksData.whatsappNo;
      socialLinksData.pinterestLink = pinterestLink || socialLinksData.pinterestLink;

      await socialLinksData.save({ validateModifiedOnly: true });

      res.status(200).json({ message: 'Social links data updated' });
    } else {
      return next(new ErrorHandler('Social links data not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
