import express from 'express';
import {
  createSolitareFluroscent,
  deleteSolitareFluroscent,
  getAllSolitareFluroscent,
  getSolitareFluroscentById,
  getSolitareFluroscentByStatusActive,
  updateSolitareFluroscent,
  updateSolitareFluroscentStatus,
} from '../../controllers/solitareMasterControllers/solitareFluroscentControllers';
const router = express.Router();

router.route('/').get(getAllSolitareFluroscent);
router.route('/create').post(createSolitareFluroscent);
router.route('/:id').get(getSolitareFluroscentById).put(updateSolitareFluroscent).delete(deleteSolitareFluroscent);
router.route('/:id/change_status').put(updateSolitareFluroscentStatus);
router.route('/list/status/active').get(getSolitareFluroscentByStatusActive);

export default router;
