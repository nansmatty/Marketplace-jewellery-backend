import express from 'express';
import { createFaq, deleteFaq, getAllFaq, getAllFaqByStatus, getFaqById, updateFaq, updateFaqStatus } from '../../controllers/generalMasterControllers/faqControllers';
const router = express.Router();

router.route('/').get(getAllFaq);
router.route('/create').post(createFaq);
router.route('/:id').get(getFaqById).put(updateFaq).delete(deleteFaq);
router.route('/:id/change_status').put(updateFaqStatus);
router.route('/list/status/active').get(getAllFaqByStatus);

export default router;
