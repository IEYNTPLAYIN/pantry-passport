import type { SupportedLanguage } from "./language.js";

export type Nutrition = {
  energyKcal?: number;
  fat?: number;
  saturatedFat?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  proteins?: number;
  salt?: number;
};

export type ProductDto = {
  id: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  language: SupportedLanguage;
  nutrition: Nutrition | null;
  nutritionAvailable: boolean;
  nutritionLocked: boolean;
};

export type ProductSearchResponse = {
  query: string;
  language: SupportedLanguage;
  products: ProductDto[];
};
