import express from 'express';
import {
  createProductWearTag,
  deleteProductWearTag,
  getAllProductWearTag,
  getProductWearTagById,
  updateProductWearTag,
  updateProductWearTagStatus,
} from '../../controllers/productMasterControllers/productWearTagControllers';

const router = express.Router();

//TODO: Admin Level Security Middleware needs to be add.

router.route('/').get(getAllProductWearTag);
router.route('/create').post(createProductWearTag);
router.route('/:id').get(getProductWearTagById).put(updateProductWearTag).delete(deleteProductWearTag);
router.route('/:id/change_status').put(updateProductWearTagStatus);

export default router;
