import express from 'express';
import { singleFileUpload } from '../../middlewares/multerMiddleware';
import { createLooseDiamond, getAllLooseDiamonds, getFiltersForLooseDiamonds, uploadLooseDiamondsExcelSheet } from '../../controllers/productMasterControllers/looseDiamondsControllers';

const router = express.Router();

router.route('/').get(getAllLooseDiamonds);
router.route('/bulk-upload').post(singleFileUpload, uploadLooseDiamondsExcelSheet);
router.route('/filteration-data').get(getFiltersForLooseDiamonds);
router.route('/create').post(createLooseDiamond);

export default router;
