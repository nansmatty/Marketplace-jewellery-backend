import express from 'express';
import {
  createDiamondShape,
  deleteDiamondShape,
  getAllDiamondShape,
  getDiamondShapeById,
  getDiamondShapeByStatusActive,
  updateDiamondShape,
  updateDiamondShapeStatus,
} from '../../controllers/diamondMasterControllers/diamondShapeControllers';
const router = express.Router();

router.route('/').get(getAllDiamondShape);
router.route('/create').post(createDiamondShape);
router.route('/:id').get(getDiamondShapeById).put(updateDiamondShape).delete(deleteDiamondShape);
router.route('/:id/change_status').put(updateDiamondShapeStatus);
router.route('/list/status/active').get(getDiamondShapeByStatusActive);

export default router;
