import express from 'express';
import {
  createLabourCharge,
  deleteLabourCharge,
  getAllLabourCharge,
  getLabourChargeById,
  getLabourChargeByStatusActive,
  updateLabourCharge,
  updateLabourChargeStatus,
} from '../../controllers/labourMasterControllers/labourChargeControllers';
const router = express.Router();

router.route('/').get(getAllLabourCharge);
router.route('/create').post(createLabourCharge);
router.route('/:id').get(getLabourChargeById).put(updateLabourCharge).delete(deleteLabourCharge);
router.route('/:id/change_status').put(updateLabourChargeStatus);
router.route('/list/status/active').get(getLabourChargeByStatusActive);

export default router;
