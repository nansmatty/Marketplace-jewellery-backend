import express from 'express';
import {
  createLabourChargeType,
  deleteLabourChargeType,
  getAllLabourChargeType,
  getLabourChargeTypeById,
  getLabourChargeTypeByStatusActive,
  updateLabourChargeType,
  updateLabourChargeTypeStatus,
} from '../../controllers/labourMasterControllers/labourChargeTypeControllers';
const router = express.Router();

router.route('/').get(getAllLabourChargeType);
router.route('/create').post(createLabourChargeType);
router.route('/:id').get(getLabourChargeTypeById).put(updateLabourChargeType).delete(deleteLabourChargeType);
router.route('/:id/change_status').put(updateLabourChargeTypeStatus);
router.route('/list/status/active').get(getLabourChargeTypeByStatusActive);

export default router;
