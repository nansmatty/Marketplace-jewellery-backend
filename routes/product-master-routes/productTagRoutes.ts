import express from 'express';
import {
  createProductTag,
  deleteProductTag,
  getAllProductTag,
  getProductTagById,
  updateProductTag,
  updateProductTagStatus,
} from '../../controllers/productMasterControllers/productTagControllers';

const router = express.Router();

//TODO: Admin Level Security Middleware needs to be add.

router.route('/').get(getAllProductTag);
router.route('/create').post(createProductTag);
router.route('/:id').get(getProductTagById).put(updateProductTag).delete(deleteProductTag);
router.route('/:id/change_status').put(updateProductTagStatus);

export default router;
