import { ApiError } from "../lib/errors.js";
import type { SupportedLanguage } from "../types/language.js";
import type { ProductSearchResponse } from "../types/product.js";

import { normalizeProduct } from "./product-normalizer.js";
import type { OpenFoodFactsService } from "./open-food-facts.service.js";
import type { SearchHistoryService } from "./search-history.service.js";
import type { SubscriptionService } from "./subscription.service.js";

type Dependencies = {
  foodFactsService: Pick<OpenFoodFactsService, "searchProducts">;
  searchHistoryService: Pick<SearchHistoryService, "recordSearch">;
  subscriptionService: Pick<SubscriptionService, "getSummary">;
};

export class ProductSearchService {
  constructor(private readonly dependencies: Dependencies) {}

  async search(userId: string, query: string, language: SupportedLanguage): Promise<ProductSearchResponse> {
    const subscription = await this.dependencies.subscriptionService.getSummary(userId);
    const products = await this.dependencies.foodFactsService.searchProducts(query, language);

    const normalizedProducts = products
      .map((product) =>
        normalizeProduct({
          product: product as Record<string, unknown>,
          language,
          canAccessNutrition: subscription.canAccessNutrition,
        }),
      )
      .filter((product): product is NonNullable<typeof product> => product !== null);

    if (!Array.isArray(normalizedProducts)) {
      throw new ApiError(500, "PRODUCT_NORMALIZATION_FAILED", "The product response could not be processed.");
    }

    await this.dependencies.searchHistoryService.recordSearch(userId, query, language, normalizedProducts.length);

    return {
      query: query.trim(),
      language,
      products: normalizedProducts,
    };
  }
}
