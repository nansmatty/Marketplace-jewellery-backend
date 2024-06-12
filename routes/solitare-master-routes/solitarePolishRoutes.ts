import express from 'express';
import {
  createSolitarePolish,
  deleteSolitarePolish,
  getAllSolitarePolish,
  getSolitarePolishById,
  getSolitarePolishByStatusActive,
  updateSolitarePolish,
  updateSolitarePolishStatus,
} from '../../controllers/solitareMasterControllers/solitarePolishControllers';
const router = express.Router();

router.route('/').get(getAllSolitarePolish);
router.route('/create').post(createSolitarePolish);
router.route('/:id').get(getSolitarePolishById).put(updateSolitarePolish).delete(deleteSolitarePolish);
router.route('/:id/change_status').put(updateSolitarePolishStatus);
router.route('/list/status/active').get(getSolitarePolishByStatusActive);

export default router;
