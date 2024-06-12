import express from 'express';
import {
  createSolitareLabs,
  deleteSolitareLabs,
  getAllSolitareLabs,
  getSolitareLabsById,
  getSolitareLabsByStatusActive,
  updateSolitareLabs,
  updateSolitareLabsStatus,
} from '../../controllers/solitareMasterControllers/solitareLabsControllers';
const router = express.Router();

router.route('/').get(getAllSolitareLabs);
router.route('/create').post(createSolitareLabs);
router.route('/:id').get(getSolitareLabsById).put(updateSolitareLabs).delete(deleteSolitareLabs);
router.route('/:id/change_status').put(updateSolitareLabsStatus);
router.route('/list/status/active').get(getSolitareLabsByStatusActive);

export default router;
