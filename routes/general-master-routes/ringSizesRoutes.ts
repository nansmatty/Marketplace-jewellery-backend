import express from 'express';
import { createRingSizes, deleteRingSizes, getAllRingSizes, getRingSizesById, updateRingSizes, updateRingSizesStatus } from '../../controllers/generalMasterControllers/ringSizesControllers';
const router = express.Router();

router.route('/').get(getAllRingSizes);
router.route('/create').post(createRingSizes);
router.route('/:id').get(getRingSizesById).put(updateRingSizes).delete(deleteRingSizes);
router.route('/:id/change_status').put(updateRingSizesStatus);

export default router;
