import express from 'express';
import {
  createDiamondQuality,
  deleteDiamondQuality,
  getAllDiamondQuality,
  getDiamondQualityById,
  getDiamondQualityByStatusActive,
  updateDiamondQuality,
  updateDiamondQualityStatus,
} from '../../controllers/diamondMasterControllers/diamondQualityControllers';
const router = express.Router();

router.route('/').get(getAllDiamondQuality);
router.route('/create').post(createDiamondQuality);
router.route('/:id').get(getDiamondQualityById).put(updateDiamondQuality).delete(deleteDiamondQuality);
router.route('/:id/change_status').put(updateDiamondQualityStatus);
router.route('/list/status/active').get(getDiamondQualityByStatusActive);

export default router;
