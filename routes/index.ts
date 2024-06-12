import { Express } from 'express';
import * as product from './product-master-routes';
import * as category from './category-master-routes';
import * as diamond from './diamond-master-routes';
import * as general from './general-master-routes';
import * as metal from './metal-master-routes';
import * as ratecard from './ratecard-master-routes';
import * as bangles from './bangle-master-routes';
import * as labour from './labour-master-routes';
import * as solitare from './solitare-master-routes';
import * as filter from './filter-master-routes';
import * as account from './account-master-routes';
import * as localization from './localization-master-routes';
import * as configuration from './configuration-master-routes';

export function routes(app: Express) {
  // Product Master Routes
  app.use('/api/v1/products', product.productRoutes);
  app.use('/api/v1/loose-diamonds', product.looseDiamondsRoutes);
  app.use('/api/v1/product-look-tags', product.productLookTagRoutes);
  app.use('/api/v1/product-tags', product.productTagRoutes);
  app.use('/api/v1/product-wear-tags', product.productWearTagRoutes);
  app.use('/api/v1/return-reasons', product.returnReasonRoutes);
  app.use('/api/v1/collections', product.collectionRoutes);
  app.use('/api/v1/styles', product.styleRoutes);
  app.use('/api/v1/wishlist', product.wishlistRoutes);
  app.use('/api/v1/reviews', product.productReviewRoutes);
  app.use('/api/v1/enquiries', product.productEnquiryRoutes);
  app.use('/api/v1/fixed-price', product.fixedPriceRoutes);

  // Category Master Routes
  app.use('/api/v1/category', category.categoryRoute);
  app.use('/api/v1/category-type', category.categoryTypesRoutes);

  // Diamond Master Routes
  app.use('/api/v1/diamond-shapes', diamond.diamondShapesRoutes);
  app.use('/api/v1/diamond-qualities', diamond.diamondQualityRoutes);
  app.use('/api/v1/diamond-clarities', diamond.diamondClarityRoutes);
  app.use('/api/v1/diamond-colors', diamond.diamondColorRoutes);
  app.use('/api/v1/diamond-sieves', diamond.diamondSievesRoutes);

  // Solitare Master Routes
  app.use('/api/v1/solitare-shapes', solitare.solitareShapeRoutes);
  app.use('/api/v1/solitare-clarities', solitare.solitareClarityRoutes);
  app.use('/api/v1/solitare-colors', solitare.solitareColorRoutes);
  app.use('/api/v1/solitare-cuts', solitare.solitareCutRoutes);
  app.use('/api/v1/solitare-fluroscents', solitare.solitareFluroscentRoutes);
  app.use('/api/v1/solitare-labs', solitare.solitareLabsRoutes);
  app.use('/api/v1/solitare-polishes', solitare.solitarePolishRoutes);
  app.use('/api/v1/solitare-symmetries', solitare.solitareSymmetryRoutes);
  app.use('/api/v1/solitare-eye-cleans', solitare.solitareEyeCleanRoutes);

  //General Master Routes
  app.use('/api/v1/colorstone', general.colorstoneRoutes);
  app.use('/api/v1/occasions', general.occasionRoutes);
  app.use('/api/v1/faqs', general.faqRoutes);
  app.use('/api/v1/ring-sizes', general.ringSizeRoutes);
  app.use('/api/v1/shop-for-modules', general.shopForModulesRoutes);

  //Metal Master Routes
  app.use('/api/v1/metal-price-types', metal.metalPriceTypeRoutes);
  app.use('/api/v1/metal-type', metal.metalTypeRoutes);
  app.use('/api/v1/metal-purity', metal.metalPurityRoutes);

  //RateCard Master Routes
  app.use('/api/v1/colorstone-rates', ratecard.colorstoneRateRoutes);
  app.use('/api/v1/diamond-rates', ratecard.diamondRateRoutes);
  app.use('/api/v1/metal-rates', ratecard.metalRateRoutes);
  app.use('/api/v1/labour-rates', ratecard.labourRateRoutes);

  //Bangle & Bracelet Master Routes
  app.use('/api/v1/bracelet-sizes', bangles.braceletSizesRoutes);
  app.use('/api/v1/bangle-sizes', bangles.bangleSizesRoutes);

  //Filter Master Routes
  app.use('/api/v1/metal-weight', filter.metalWeightRoutes);
  app.use('/api/v1/price-range', filter.priceRangeRoutes);

  //labour Master Routes
  app.use('/api/v1/labour-charge-type', labour.labourChargeType);
  app.use('/api/v1/labour-charge', labour.labourCharge);

  //Account Master Routes
  app.use('/api/v1/master-modules', account.masterModuleRoutes);
  app.use('/api/v1/permissions', account.permissionRoutes);
  app.use('/api/v1/roles', account.rolesRoutes);
  app.use('/api/v1/address', account.addressRoutes);
  app.use('/api/v1/kyc-data', account.kycDataRoutes);
  app.use('/api/v1/mobile', account.mobileRoutes);
  app.use('/api/v1/users', account.userRoutes);

  //Localization Master Routes
  app.use('/api/v1/pincodes', localization.pincodeRoutes);
  app.use('/api/v1/states', localization.stateRoutes);
  app.use('/api/v1/city', localization.cityRoutes);
  app.use('/api/v1/country', localization.countryRoutes);

  //Configuration Master Routes
  app.use('/api/v1/product-configurations', configuration.productConfigurationsRoutes);
  app.use('/api/v1/rate-configurations', configuration.rateConfigurationsRoutes);
  app.use('/api/v1/social-links', configuration.socialLinksRoutes);
}
