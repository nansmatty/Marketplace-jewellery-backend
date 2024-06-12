import express from 'express';
import {
  createMetalRateChart,
  deleteMetalRateChart,
  getAllMetalRateChart,
  getAllMetalRateChartStatusActive,
  getMetalRateChartById,
  updateMetalRateChart,
  updateMetalRateChartStatus,
} from '../../controllers/rateCardMasterControllers/metalRateControllers';
const router = express.Router();

router.route('/').get(getAllMetalRateChart);
router.route('/create').post(createMetalRateChart);
router.route('/:id').get(getMetalRateChartById).put(updateMetalRateChart).delete(deleteMetalRateChart);
router.route('/:id/change_status').put(updateMetalRateChartStatus);
router.route('/list/status/active').get(getAllMetalRateChartStatusActive);

export default router;
