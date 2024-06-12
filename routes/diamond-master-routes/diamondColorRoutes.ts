import express from 'express';
import {
  createDiamondColor,
  deleteDiamondColor,
  getAllDiamondColor,
  getDiamondColorById,
  getDiamondColorByStatusActive,
  updateDiamondColor,
  updateDiamondColorStatus,
} from '../../controllers/diamondMasterControllers/diamondColorControllers';
const router = express.Router();

router.route('/').get(getAllDiamondColor);
router.route('/create').post(createDiamondColor);
router.route('/:id').get(getDiamondColorById).put(updateDiamondColor).delete(deleteDiamondColor);
router.route('/:id/change_status').put(updateDiamondColorStatus);
router.route('/list/status/active').get(getDiamondColorByStatusActive);

export default router;
