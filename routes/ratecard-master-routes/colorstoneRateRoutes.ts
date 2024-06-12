import express from 'express';
import { singleFileUpload } from '../../middlewares/multerMiddleware';
import {
  createColorstoneRate,
  deleteColorstoneRate,
  getAllColorstoneRateChart,
  getColorstoneRateChartById,
  updateColorstoneRate,
  updateColorstoneRateStatus,
} from '../../controllers/rateCardMasterControllers/colorstoneRateControllers';
const router = express.Router();

router.route('/').get(getAllColorstoneRateChart);
router.route('/create').post(singleFileUpload, createColorstoneRate);
router.route('/:id').get(getColorstoneRateChartById).put(singleFileUpload, updateColorstoneRate).delete(deleteColorstoneRate);
router.route('/:id/status').put(updateColorstoneRateStatus);

export default router;
