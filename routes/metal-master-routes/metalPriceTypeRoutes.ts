import express from 'express';
import {
  createMetalPriceType,
  deleteMetalPriceType,
  getAllMetalPriceType,
  getAllMetalPriceTypeByStatus,
  getMetalPriceTypeById,
  updateMetalPriceType,
  updateMetalPriceTypeStatus,
} from '../../controllers/metalMasterControllers/metalPriceTypeControllers';
const router = express.Router();

router.route('/').get(getAllMetalPriceType);
router.route('/create').post(createMetalPriceType);
router.route('/:id').get(getMetalPriceTypeById).put(updateMetalPriceType).delete(deleteMetalPriceType);
router.route('/:id/change_status').put(updateMetalPriceTypeStatus);
router.route('/list/status/active').get(getAllMetalPriceTypeByStatus);

export default router;
