import { NextFunction, Request, Response } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import { TQueryParams } from '../../@types/commonTypes';
import Wishlist from '../../models/Product-Master-Models/WishlistModel';
import Product from '../../models/Product-Master-Models/ProductModel';

export const getAllWishListData = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageSize, pageNumber } = req.query as TQueryParams;
    const page = Number(pageNumber) || 1;

    const sizeOfPage = Number(pageSize) || 10;

    const count = await Wishlist.countDocuments();
    const skipDoc = sizeOfPage * (page - 1);
    const pages = Math.ceil(count / sizeOfPage);

    const wishlist = await Wishlist.find({ user_id: req.user?._id }).populate('product_id', 'title sku').limit(sizeOfPage).skip(skipDoc).select('-createdAt -updatedAt -__v');

    return res.status(200).json({ wishlist, page, pages });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});

export const addOrRemoveProductFromWishlist = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product_id: any = req.params.product_id;
    const wishlistData = await Wishlist.findOne({ user_id: req.user?._id });

    const productIdChecking = await Product.findById(product_id);

    if (productIdChecking) {
      if (!wishlistData) {
        await Wishlist.create({ user_id: req.user?._id, product_id: [product_id] });

        return res.status(200).json({ message: 'Product added to wishlist.' });
      } else {
        const productIndex = wishlistData.product_id.indexOf(product_id);

        if (productIndex === -1) {
          wishlistData.product_id.push(product_id);
          await wishlistData.save();
          return res.status(200).json({ message: 'Product added to wishlist.' });
        } else {
          wishlistData.product_id.splice(productIndex, 1);
          await wishlistData.save();
          return res.status(200).json({ message: 'Product removed from wishlist.' });
        }
      }
    } else {
      return next(new ErrorHandler('Product not found', 404));
    }
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
