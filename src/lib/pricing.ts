// Source of truth for package prices, kept in sync with PACKAGES in
// src/components/PricingCards.tsx. Prices are in Toman (تومان).
export const PACKAGE_PRICE_TOMAN: Record<string, number> = {
  daily: 250_000,
  weekend: 650_000,
  weekly: 1_400_000,
  monthly: 4_500_000,
};

export function getPackagePriceToman(slug: string): number | null {
  return PACKAGE_PRICE_TOMAN[slug] ?? null;
}