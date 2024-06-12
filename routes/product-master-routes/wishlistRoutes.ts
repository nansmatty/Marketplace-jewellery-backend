import express from 'express';
import { addOrRemoveProductFromWishlist, getAllWishListData } from '../../controllers/productMasterControllers/wishlistControllers';
import { isAuthenticated } from '../../middlewares/authMiddleware';
const router = express.Router();

router.route('/').get(isAuthenticated, getAllWishListData);
router.route('/:product_id').post(isAuthenticated, addOrRemoveProductFromWishlist);

export default router;
