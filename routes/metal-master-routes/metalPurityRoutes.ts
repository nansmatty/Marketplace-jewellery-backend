import express from 'express';
import {
  createMetalPurity,
  deleteMetalPurity,
  getAllMetalPurity,
  getMetalPurityById,
  getMetalPurityByMetal,
  updateMetalPurity,
  updateMetalPurityStatus,
} from '../../controllers/metalMasterControllers/metalPurityController';
const router = express.Router();

router.route('/').get(getAllMetalPurity);
router.route('/create').post(createMetalPurity);
router.route('/:id').get(getMetalPurityById).put(updateMetalPurity).delete(deleteMetalPurity);
router.route('/:id/change_status').put(updateMetalPurityStatus);
router.route('/list/metalPriceType/:metalPriceTypeId').get(getMetalPurityByMetal);

export default router;
