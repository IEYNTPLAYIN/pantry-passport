import { describe, expect, it } from "vitest";

import { normalizeProduct } from "../src/services/product-normalizer.js";

describe("normalizeProduct", () => {
  it("handles missing optional Open Food Facts fields safely", () => {
    const product = normalizeProduct({
      product: {
        code: "123",
        product_name: "Test Pasta",
      },
      language: "en",
      canAccessNutrition: false,
    });

    expect(product).toEqual({
      id: "123",
      name: "Test Pasta",
      brand: null,
      imageUrl: null,
      language: "en",
      nutrition: null,
      nutritionAvailable: false,
      nutritionLocked: false,
    });
  });
});
