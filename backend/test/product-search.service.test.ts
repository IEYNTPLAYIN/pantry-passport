import { describe, expect, it, vi } from "vitest";

import { ApiError } from "../src/lib/errors.js";
import { ProductSearchService } from "../src/services/product-search.service.js";

describe("ProductSearchService", () => {
  it("does not return nutrition data to unsubscribed users", async () => {
    const service = new ProductSearchService({
      foodFactsService: {
        searchProducts: vi.fn().mockResolvedValue([
          {
            code: "100",
            product_name: "Granola",
            nutriments: {
              fat_100g: 8,
            },
          },
        ]),
      },
      searchHistoryService: {
        recordSearch: vi.fn().mockResolvedValue(undefined),
      },
      subscriptionService: {
        getSummary: vi.fn().mockResolvedValue({
          status: "CANCELED",
          isActive: false,
          canAccessNutrition: false,
        }),
      },
    });

    const result = await service.search("user-1", "granola", "en");
    expect(result.products[0]?.nutrition).toBeNull();
    expect(result.products[0]?.nutritionLocked).toBe(true);
  });

  it("returns nutrition data to active subscribers", async () => {
    const service = new ProductSearchService({
      foodFactsService: {
        searchProducts: vi.fn().mockResolvedValue([
          {
            code: "100",
            product_name: "Granola",
            nutriments: {
              proteins_100g: 5,
            },
          },
        ]),
      },
      searchHistoryService: {
        recordSearch: vi.fn().mockResolvedValue(undefined),
      },
      subscriptionService: {
        getSummary: vi.fn().mockResolvedValue({
          status: "ACTIVE",
          isActive: true,
          canAccessNutrition: true,
        }),
      },
    });

    const result = await service.search("user-1", "granola", "en");
    expect(result.products[0]?.nutrition?.proteins).toBe(5);
    expect(result.products[0]?.nutritionLocked).toBe(false);
  });

  it("surfaces Open Food Facts failures as API errors", async () => {
    const service = new ProductSearchService({
      foodFactsService: {
        searchProducts: vi.fn().mockRejectedValue(new ApiError(502, "OPEN_FOOD_FACTS_ERROR", "failure")),
      },
      searchHistoryService: {
        recordSearch: vi.fn().mockResolvedValue(undefined),
      },
      subscriptionService: {
        getSummary: vi.fn().mockResolvedValue({
          status: "ACTIVE",
          isActive: true,
          canAccessNutrition: true,
        }),
      },
    });

    await expect(service.search("user-1", "granola", "en")).rejects.toMatchObject({
      code: "OPEN_FOOD_FACTS_ERROR",
    });
  });
});
