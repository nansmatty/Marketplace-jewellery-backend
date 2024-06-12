import express from 'express';
import {
  createSolitareSymmetry,
  deleteSolitareSymmetry,
  getAllSolitareSymmetry,
  getSolitareSymmetryById,
  getSolitareSymmetryByStatusActive,
  updateSolitareSymmetry,
  updateSolitareSymmetryStatus,
} from '../../controllers/solitareMasterControllers/solitareSymmetryControllers';
const router = express.Router();

router.route('/').get(getAllSolitareSymmetry);
router.route('/create').post(createSolitareSymmetry);
router.route('/:id').get(getSolitareSymmetryById).put(updateSolitareSymmetry).delete(deleteSolitareSymmetry);
router.route('/:id/change_status').put(updateSolitareSymmetryStatus);
router.route('/list/status/active').get(getSolitareSymmetryByStatusActive);

export default router;
