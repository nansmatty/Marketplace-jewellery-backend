import express from 'express';
import {
  createSolitareShape,
  deleteSolitareShape,
  getAllSolitareShape,
  getSolitareShapeById,
  getSolitareShapeByStatusActive,
  updateSolitareShape,
  updateSolitareShapeStatus,
} from '../../controllers/solitareMasterControllers/solitareShapeControllers';
const router = express.Router();

router.route('/').get(getAllSolitareShape);
router.route('/create').post(createSolitareShape);
router.route('/:id').get(getSolitareShapeById).put(updateSolitareShape).delete(deleteSolitareShape);
router.route('/:id/change_status').put(updateSolitareShapeStatus);
router.route('/list/status/active').get(getSolitareShapeByStatusActive);

export default router;
