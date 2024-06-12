import express from 'express';
import {
  createSolitareColor,
  deleteSolitareColor,
  getAllSolitareColor,
  getSolitareColorById,
  getSolitareColorByStatusActive,
  updateSolitareColor,
  updateSolitareColorStatus,
} from '../../controllers/solitareMasterControllers/solitareColorControllers';
const router = express.Router();

router.route('/').get(getAllSolitareColor);
router.route('/create').post(createSolitareColor);
router.route('/:id').get(getSolitareColorById).put(updateSolitareColor).delete(deleteSolitareColor);
router.route('/:id/change_status').put(updateSolitareColorStatus);
router.route('/list/status/active').get(getSolitareColorByStatusActive);

export default router;
