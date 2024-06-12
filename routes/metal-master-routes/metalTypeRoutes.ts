import express from 'express';
import {
  createMetalType,
  deleteMetalType,
  getAllMetalType,
  getMetalTypeById,
  getMetalTypeByMetalPriceType,
  updateMetalType,
  updateMetalTypeStatus,
} from '../../controllers/metalMasterControllers/metalTypeController';
const router = express.Router();

router.route('/').get(getAllMetalType);
router.route('/create').post(createMetalType);
router.route('/:id').get(getMetalTypeById).put(updateMetalType).delete(deleteMetalType);
router.route('/:id/change_status').put(updateMetalTypeStatus);
router.route('/list/metalPriceType/:metalPriceTypeId').get(getMetalTypeByMetalPriceType);

export default router;
