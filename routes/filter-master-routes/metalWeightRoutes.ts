import express from 'express';
import {
  createMetalWeight,
  deleteMetalWeight,
  getAllMetalWeight,
  getAllMetalWeightByStatus,
  getMetalWeightById,
  updateMetalWeight,
  updateMetalWeightStatus,
} from '../../controllers/filterMasterControllers/metalWeightControllers';
const router = express.Router();

router.route('/').get(getAllMetalWeight);
router.route('/create').post(createMetalWeight);
router.route('/:id').get(getMetalWeightById).put(updateMetalWeight).delete(deleteMetalWeight);
router.route('/:id/change_status').put(updateMetalWeightStatus);
router.route('/list/status/active').get(getAllMetalWeightByStatus);

export default router;
