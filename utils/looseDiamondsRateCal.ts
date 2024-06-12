export const looseDiamondRateCalculation = (
  carat: number,
  additional_charge_type: 'PERCENTAGE' | 'FLAT',
  additional_charge: number,
  discount_charge_type: 'PERCENTAGE' | 'FLAT',
  discount_charge: number,
  price_per_carat: number
) => {
  let price_per_carat_final = price_per_carat;
  let final_price;

  if (additional_charge_type === 'FLAT' && additional_charge > 0) {
    price_per_carat_final += additional_charge;
  } else if (additional_charge_type === 'PERCENTAGE' && additional_charge > 0) {
    price_per_carat_final += price_per_carat * (additional_charge / 100);
  }

  if (discount_charge_type === 'FLAT' && discount_charge > 0) {
    price_per_carat_final -= discount_charge;
  } else if (discount_charge_type === 'PERCENTAGE' && discount_charge > 0) {
    price_per_carat_final -= price_per_carat * (discount_charge / 100);
  }

  final_price = Math.round(price_per_carat_final * carat).toFixed(2);

  return { price_per_carat_final, final_price };
};
