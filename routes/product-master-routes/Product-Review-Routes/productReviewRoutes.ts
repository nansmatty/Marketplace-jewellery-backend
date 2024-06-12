import express from 'express';
import {
  createReview,
  deleteReview,
  getAllReviewByProduct,
  getReviewById,
  reviewDislike,
  reviewLike,
  updateReview,
} from '../../../controllers/productMasterControllers/Product-Review-Controllers/productReviewControllers';
const router = express.Router();

router.route('/:id').get(getReviewById).put(updateReview).delete(deleteReview);
router.route('/:product_id/list').get(getAllReviewByProduct);
router.route('/:product_id/create').post(createReview);
router.route('/:product_id/like').put(reviewLike);
router.route('/:product_id/dislike').put(reviewDislike);
router.route('/:product_id/average-rating').get(reviewDislike);

export default router;
