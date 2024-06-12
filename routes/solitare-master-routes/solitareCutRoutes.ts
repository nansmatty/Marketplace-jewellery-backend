import express from 'express';
import {
  createSolitareCut,
  deleteSolitareCut,
  getAllSolitareCut,
  getSolitareCutById,
  getSolitareCutByStatusActive,
  updateSolitareCut,
  updateSolitareCutStatus,
} from '../../controllers/solitareMasterControllers/solitareCutControllers';
const router = express.Router();

router.route('/').get(getAllSolitareCut);
router.route('/create').post(createSolitareCut);
router.route('/:id').get(getSolitareCutById).put(updateSolitareCut).delete(deleteSolitareCut);
router.route('/:id/change_status').put(updateSolitareCutStatus);
router.route('/list/status/active').get(getSolitareCutByStatusActive);

export default router;
