import express from 'express';
import {
  createDiamondRateChart,
  deleteDiamondRate,
  getAllDiamondRateChart,
  getDiamondRateChartById,
  updateDiamondRateChart,
  updateDiamondRateStatus,
} from '../../controllers/rateCardMasterControllers/diamondRateControllers';
import { singleFileUpload } from '../../middlewares/multerMiddleware';
const router = express.Router();

router.route('/').get(getAllDiamondRateChart);
router.route('/create').post(singleFileUpload, createDiamondRateChart);
router.route('/:id').get(getDiamondRateChartById).put(singleFileUpload, updateDiamondRateChart).delete(deleteDiamondRate);
router.route('/:id/status').put(updateDiamondRateStatus);

export default router;
