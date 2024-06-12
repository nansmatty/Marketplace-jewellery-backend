import express from 'express';
import {
  createProductLookTag,
  deleteProductLookTag,
  getAllProductLookTag,
  getProductLookTagById,
  updateProductLookTag,
  updateProductLookTagStatus,
} from '../../controllers/productMasterControllers/productLookTagControllers';

const router = express.Router();

//TODO: Admin Level Security Middleware needs to be add.

router.route('/').get(getAllProductLookTag);
router.route('/create').post(createProductLookTag);
router.route('/:id').get(getProductLookTagById).put(updateProductLookTag).delete(deleteProductLookTag);
router.route('/:id/change_status').put(updateProductLookTagStatus);

export default router;
