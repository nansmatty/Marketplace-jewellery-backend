import express from 'express';
import {
  createCollection,
  deleteCollection,
  getAllCollections,
  getCollectionById,
  updateCollection,
  updateCollectionStatus,
} from '../../controllers/productMasterControllers/collectionController';

const router = express.Router();

//TODO: Admin Level Security Middleware needs to be add.

router.route('/').get(getAllCollections);
router.route('/create').post(createCollection);
router.route('/:id').get(getCollectionById).put(updateCollection).delete(deleteCollection);
router.route('/:id/change_status').put(updateCollectionStatus);

export default router;
