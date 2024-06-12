import express from 'express';
import {
  createSolitareClarity,
  deleteSolitareClarity,
  getAllSolitareClarity,
  getSolitareClarityById,
  getSolitareClarityByStatusActive,
  updateSolitareClarity,
  updateSolitareClarityStatus,
} from '../../controllers/solitareMasterControllers/solitareClarityControllers';
const router = express.Router();

router.route('/').get(getAllSolitareClarity);
router.route('/create').post(createSolitareClarity);
router.route('/:id').get(getSolitareClarityById).put(updateSolitareClarity).delete(deleteSolitareClarity);
router.route('/:id/change_status').put(updateSolitareClarityStatus);
router.route('/list/status/active').get(getSolitareClarityByStatusActive);

export default router;
