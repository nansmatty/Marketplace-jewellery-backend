import express from 'express';
import {
  createOccasion,
  deleteOccasion,
  getAllOccasion,
  getAllOccasionByStatus,
  getOccasionById,
  updateOccasion,
  updateOccasionStatus,
} from '../../controllers/generalMasterControllers/occasionControllers';
const router = express.Router();

router.route('/').get(getAllOccasion);
router.route('/create').post(createOccasion);
router.route('/:id').get(getOccasionById).put(updateOccasion).delete(deleteOccasion);
router.route('/:id/change_status').put(updateOccasionStatus);
router.route('/list/status/active').get(getAllOccasionByStatus);

export default router;
