import express from 'express';
import {
  createDiamondSieves,
  deleteDiamondSieves,
  getAllDiamondSieves,
  getDiamondSievesById,
  getDiamondSievesByStatusActive,
  updateDiamondSieves,
  updateDiamondSievesStatus,
} from '../../controllers/diamondMasterControllers/diamondSievesControllers';
const router = express.Router();

router.route('/').get(getAllDiamondSieves);
router.route('/create').post(createDiamondSieves);
router.route('/:id').get(getDiamondSievesById).put(updateDiamondSieves).delete(deleteDiamondSieves);
router.route('/:id/change_status').put(updateDiamondSievesStatus);
router.route('/list/status/active').get(getDiamondSievesByStatusActive);

export default router;
