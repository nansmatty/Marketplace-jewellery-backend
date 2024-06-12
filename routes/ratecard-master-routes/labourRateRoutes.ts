import express from 'express';
import {
  createLabourRateChart,
  deleteLabourRateChart,
  getAllLabourRateChart,
  getAllLabourRateChartStatusActive,
  getLabourRateChartById,
  updateLabourRateChart,
  updateLabourRateChartStatus,
} from '../../controllers/rateCardMasterControllers/labourRateControllers';
const router = express.Router();

router.route('/').get(getAllLabourRateChart);
router.route('/create').post(createLabourRateChart);
router.route('/:id').get(getLabourRateChartById).put(updateLabourRateChart).delete(deleteLabourRateChart);
router.route('/:id/change_status').put(updateLabourRateChartStatus);
router.route('/list/status/active').get(getAllLabourRateChartStatusActive);

export default router;
