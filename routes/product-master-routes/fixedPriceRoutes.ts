import express from 'express';
import { getFixedProductPriceByProductId } from '../../controllers/productMasterControllers/fixedPriceControllers';
const router = express.Router();

router.route('/:product_id').get(getFixedProductPriceByProductId);

export default router;
