import { TPriceList } from '../@types/ratecardTypes';

export const calculateMetalRate = (base_price: number, pricelist: TPriceList): number => {
  let rate = base_price * (pricelist.percentage / 100);

  if (pricelist.additional_charge_type === 'FLAT' && pricelist.additional_charge > 0) {
    rate = rate + pricelist.additional_charge;
  }

  if (pricelist.additional_charge_type === 'PERCENTAGE' && pricelist.additional_charge > 0) {
    rate = rate + rate * (pricelist.additional_charge / 100);
  }

  if (pricelist.discount_type === 'FLAT' && pricelist.discount > 0) {
    rate = rate - pricelist.discount;
  }

  if (pricelist.discount_type === 'PERCENTAGE' && pricelist.discount > 0) {
    rate = rate - rate * (pricelist.discount / 100);
  }

  return rate;
};
