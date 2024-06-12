import express from 'express';
import {
  createSolitareEyeClean,
  deleteSolitareEyeClean,
  getAllSolitareEyeClean,
  getSolitareEyeCleanById,
  getSolitareEyeCleanByStatusActive,
  updateSolitareEyeClean,
  updateSolitareEyeCleanStatus,
} from '../../controllers/solitareMasterControllers/solitareEyeCleanControllers';
const router = express.Router();

router.route('/').get(getAllSolitareEyeClean);
router.route('/create').post(createSolitareEyeClean);
router.route('/:id').get(getSolitareEyeCleanById).put(updateSolitareEyeClean).delete(deleteSolitareEyeClean);
router.route('/:id/change_status').put(updateSolitareEyeCleanStatus);
router.route('/list/status/active').get(getSolitareEyeCleanByStatusActive);

export default router;
