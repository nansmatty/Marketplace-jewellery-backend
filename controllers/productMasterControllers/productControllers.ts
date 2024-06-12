import { NextFunction, Request, Response } from 'express';
import xlsx from 'xlsx';
import CatchAsyncError from '../../utils/catchAsyncError';
import ErrorHandler from '../../utils/errorHandler';
import Product from '../../models/Product-Master-Models/ProductModel';
import { excelHeadingMatch } from '../../utils/excelHeadingMatch';
import { arrSpliting, stringSpliting } from '../../utils/commonFunction';
import FixedProductPrice from '../../models/Product-Master-Models/FixedProductPriceModel';

export const bulkProductUpdateAndCreate = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;

    const seller_id = req.user?._id;

    if (!file) {
      return next(new ErrorHandler('No files are uploaded', 400));
    }
    const productWorkbook = xlsx.read(file.buffer);

    const productSchemaFields = Object.keys(Product.schema.obj);

    const productFilteredDatabaseFields = productSchemaFields.filter((field) => field !== 'seller_id');

    const { headingsMatch, excelDataConvertIntoJsonData: jsonData } = excelHeadingMatch(productWorkbook, productFilteredDatabaseFields);

    if (!headingsMatch) {
      return next(new ErrorHandler('Excel headings do not match expected fields', 400));
    }

    // Process jsonData
    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      const existingProduct = await Product.findOne({ $and: [{ seller_id }, { sku: item.sku }] });

      const fixedPrice = await FixedProductPrice.findOne({ $and: [{ seller_id: item.seller_id }, { product_id: existingProduct?._id }] });

      // If the diamond with the same item_id exists, skip it
      if (existingProduct) {
        existingProduct.title = item.title || existingProduct.title;
        existingProduct.hsn_code = item.hsn_code || existingProduct.hsn_code;
        existingProduct.type = item.type || existingProduct.type;
        existingProduct.category_type = item.category_type || existingProduct.category_type;
        existingProduct.category = item.category || existingProduct.category;
        existingProduct.style = item.style || existingProduct.style;
        existingProduct.product_collection = item.product_collection || existingProduct.product_collection;
        existingProduct.labour_type = item.labour_type || existingProduct.labour_type;
        existingProduct.occasion = item.occasion || existingProduct.occasion;
        existingProduct.size = arrSpliting(item.size) || existingProduct.size;
        existingProduct.default_size = item.default_size || existingProduct.default_size;
        existingProduct.gross_weight = item.gross_weight || existingProduct.gross_weight;
        existingProduct.shop_for_module = item.shop_for_module || existingProduct.shop_for_module;
        existingProduct.product_look_tag = item.product_look_tag || existingProduct.product_look_tag;
        existingProduct.product_wear_tag = item.product_wear_tag || existingProduct.product_wear_tag;
        existingProduct.product_tag = item.product_tag || existingProduct.product_tag;
        existingProduct.customizable = item.customizable || existingProduct.customizable;
        existingProduct.certificate = item.certificate || existingProduct.certificate;
        existingProduct.hallmark = item.hallmark || existingProduct.hallmark;
        existingProduct.stamping = item.stamping || existingProduct.stamping;
        existingProduct.dimension_length = item.dimension_length || existingProduct.dimension_length;
        existingProduct.dimension_width = item.dimension_width || existingProduct.dimension_width;
        existingProduct.default_metal_made_type = item.default_metal_made_type || existingProduct.default_metal_made_type;
        existingProduct.default_metal_type = item.default_metal_type || existingProduct.default_metal_type;
        existingProduct.default_metal_purity_type = item.default_metal_purity_type || existingProduct.default_metal_purity_type;
        existingProduct.default_metal_weight = item.default_metal_weight || existingProduct.default_metal_weight;
        existingProduct.metal_made_type = item.metal_made_type || existingProduct.metal_made_type;
        existingProduct.metal_purity = stringSpliting(item.metal_purity) || existingProduct.metal_purity;
        existingProduct.metal_type = stringSpliting(item.metal_type) || existingProduct.metal_type;
        existingProduct.net_weight = item.net_weight || existingProduct.net_weight;
        existingProduct.colorstone = stringSpliting(item.colorstone) || existingProduct.colorstone;
        existingProduct.colorstone_shape = stringSpliting(item.colorstone_shape) || existingProduct.colorstone_shape;
        existingProduct.colorstone_weight = arrSpliting(item.colorstone_weight) || existingProduct.colorstone_weight;
        existingProduct.colorstone_pcs = arrSpliting(item.colorstone_pcs) || existingProduct.colorstone_pcs;
        existingProduct.diamond_shape = stringSpliting(item.diamond_shape) || existingProduct.diamond_shape;
        existingProduct.diamond_quality = item.diamond_quality || existingProduct.diamond_quality;
        existingProduct.diamond_sieve = stringSpliting(item.diamond_sieve) || existingProduct.diamond_sieve;
        existingProduct.diamond_weight = arrSpliting(item.diamond_weight) || existingProduct.diamond_weight;
        existingProduct.diamond_pcs = arrSpliting(item.diamond_pcs) || existingProduct.diamond_pcs;

        if (item.is_mrp && item.is_mrp === 'yes') {
          existingProduct.is_mrp = item.is_mrp || existingProduct.is_mrp;

          if (fixedPrice) {
            fixedPrice.product_price = item.mrp_price || fixedPrice.product_price;
          } else {
            await FixedProductPrice.create({
              seller_id,
              product_id: existingProduct._id,
              product_price: item.mrp_price,
            });
          }
        }

        // existingProduct.mrp_price = item.mrp_price || existingProduct.mrp_price;
        existingProduct.short_description = item.short_description || existingProduct.short_description;
        existingProduct.long_description = item.long_description || existingProduct.long_description;
        existingProduct.min_order_qty = item.min_order_qty || existingProduct.min_order_qty;
        existingProduct.max_order_qty = item.max_order_qty || existingProduct.max_order_qty;
        existingProduct.available_for_order = item.available_for_order || existingProduct.available_for_order;
        existingProduct.seo_title = item.seo_title || existingProduct.seo_title;
        existingProduct.seo_keywords = stringSpliting(item.seo_keywords) || existingProduct.seo_keywords;
        existingProduct.seo_description = item.seo_description || existingProduct.seo_description;
        existingProduct.status = item.status || existingProduct.status;

        existingProduct.save({ validateModifiedOnly: true });
      }

      item.seller_id = seller_id;
      if (item.size) item.size = arrSpliting(item.size);
      if (item.metal_purity) item.metal_purity = stringSpliting(item.metal_purity);
      if (item.metal_type) item.metal_type = stringSpliting(item.metal_type);
      if (item.colorstone) item.colorstone = stringSpliting(item.colorstone);
      if (item.colorstone_shape) item.colorstone_shape = stringSpliting(item.colorstone_shape);
      if (item.colorstone_weight) item.colorstone_weight = arrSpliting(item.colorstone_weight);
      if (item.colorstone_pcs) item.colorstone_pcs = arrSpliting(item.colorstone_pcs);
      if (item.diamond_shape) item.diamond_shape = stringSpliting(item.diamond_shape);
      if (item.diamond_sieve) item.diamond_sieve = stringSpliting(item.diamond_sieve);
      if (item.diamond_weight) item.diamond_weight = arrSpliting(item.diamond_weight);
      if (item.diamond_pcs) item.diamond_pcs = arrSpliting(item.diamond_pcs);
      if (item.seo_keywords) item.seo_keywords = stringSpliting(item.seo_keywords);

      const product = await Product.create(item);

      if (item.is_mrp && item.is_mrp === 'yes') {
        await FixedProductPrice.create({
          seller_id: product.seller_id,
          product_id: product._id,
          product_price: item.mrp_price,
        });
      }
    }
    return res.json({ success: true, message: 'Data uploaded successfully' });
  } catch (error) {
    return next(new ErrorHandler(`${error}`, 500));
  }
});
