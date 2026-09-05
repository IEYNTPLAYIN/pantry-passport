import { randomUUID } from "node:crypto";

import type { SupportedLanguage } from "../types/language.js";
import type { Nutrition, ProductDto } from "../types/product.js";

type OpenFoodFactsProduct = Record<string, unknown>;

type NormalizeProductArgs = {
  product: OpenFoodFactsProduct;
  language: SupportedLanguage;
  canAccessNutrition: boolean;
};

function pickLocalizedString(product: OpenFoodFactsProduct, language: SupportedLanguage, fallbackKey: string) {
  const localizedValue = product[`${fallbackKey}_${language}`];
  if (typeof localizedValue === "string" && localizedValue.trim()) {
    return localizedValue.trim();
  }

  const fallbackValue = product[fallbackKey];
  if (typeof fallbackValue === "string" && fallbackValue.trim()) {
    return fallbackValue.trim();
  }

  const englishValue = product[`${fallbackKey}_en`];
  if (typeof englishValue === "string" && englishValue.trim()) {
    return englishValue.trim();
  }

  return null;
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeNutrition(product: OpenFoodFactsProduct): Nutrition | null {
  const nutriments = product.nutriments;
  if (!nutriments || typeof nutriments !== "object") {
    return null;
  }

  const record = nutriments as Record<string, unknown>;

  const nutritionEntries = {
    energyKcal: getNumber(record["energy-kcal_100g"]),
    fat: getNumber(record.fat_100g),
    saturatedFat: getNumber(record["saturated-fat_100g"]),
    carbohydrates: getNumber(record.carbohydrates_100g),
    sugars: getNumber(record.sugars_100g),
    fiber: getNumber(record.fiber_100g),
    proteins: getNumber(record.proteins_100g),
    salt: getNumber(record.salt_100g),
  };

  const nutrition = Object.fromEntries(
    Object.entries(nutritionEntries).filter((entry): entry is [string, number] => typeof entry[1] === "number"),
  ) as Nutrition;

  return Object.values(nutrition).some((value) => typeof value === "number") ? nutrition : null;
}

function getProductId(product: OpenFoodFactsProduct) {
  const code = product.code;
  if (typeof code === "string" && code.trim()) {
    return code.trim();
  }

  const id = product.id;
  if (typeof id === "string" && id.trim()) {
    return id.trim();
  }

  return randomUUID();
}

export function normalizeProduct({ product, language, canAccessNutrition }: NormalizeProductArgs): ProductDto | null {
  const name =
    pickLocalizedString(product, language, "product_name") ??
    pickLocalizedString(product, language, "generic_name");

  if (!name) {
    return null;
  }

  const nutrition = normalizeNutrition(product);
  const nutritionAvailable = nutrition !== null;

  return {
    id: getProductId(product),
    name,
    brand: pickLocalizedString(product, language, "brands"),
    imageUrl: typeof product.image_front_url === "string" ? product.image_front_url : null,
    language,
    nutrition: canAccessNutrition ? nutrition : null,
    nutritionAvailable,
    nutritionLocked: nutritionAvailable && !canAccessNutrition,
  };
}
