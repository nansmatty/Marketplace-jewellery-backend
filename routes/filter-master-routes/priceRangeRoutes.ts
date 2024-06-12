import express from 'express';
import {
  createPriceRange,
  deletePriceRange,
  getAllPriceRange,
  getAllPriceRangeByStatus,
  getPriceRangeById,
  updatePriceRange,
  updatePriceRangeStatus,
} from '../../controllers/filterMasterControllers/priceRangeControllers';
const router = express.Router();

router.route('/').get(getAllPriceRange);
router.route('/create').post(createPriceRange);
router.route('/:id').get(getPriceRangeById).put(updatePriceRange).delete(deletePriceRange);
router.route('/:id/change_status').put(updatePriceRangeStatus);
router.route('/list/status/active').get(getAllPriceRangeByStatus);

export default router;
