import express from 'express';
import {
  createColorstone,
  deleteColorstone,
  getAllColorstone,
  getColorstoneById,
  updateColorstone,
  updateColorstoneStatus,
} from '../../controllers/generalMasterControllers/colorstoneControllers';
const router = express.Router();

router.route('/').get(getAllColorstone);
router.route('/create').post(createColorstone);
router.route('/:id').get(getColorstoneById).put(updateColorstone).delete(deleteColorstone);
router.route('/:id/change_status').put(updateColorstoneStatus);

export default router;
