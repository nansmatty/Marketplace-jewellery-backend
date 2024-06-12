import express from 'express';
import {
  createDiamondClarity,
  deleteDiamondClarity,
  getAllDiamondClarity,
  getDiamondClarityById,
  getDiamondClarityByStatusActive,
  updateDiamondClarity,
  updateDiamondClarityStatus,
} from '../../controllers/diamondMasterControllers/diamondClarityControllers';
const router = express.Router();

router.route('/').get(getAllDiamondClarity);
router.route('/create').post(createDiamondClarity);
router.route('/:id').get(getDiamondClarityById).put(updateDiamondClarity).delete(deleteDiamondClarity);
router.route('/:id/change_status').put(updateDiamondClarityStatus);
router.route('/list/status/active').get(getDiamondClarityByStatusActive);

export default router;
