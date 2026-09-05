import { ApiError } from "../lib/errors.js";
import type { SupportedLanguage } from "../types/language.js";

type OpenFoodFactsSearchResponse = {
  products?: unknown[];
};

export class OpenFoodFactsService {
  constructor(private readonly baseUrl: string) {}

  async searchProducts(query: string, language: SupportedLanguage) {
    const url = new URL("/cgi/search.pl", this.baseUrl);
    url.searchParams.set("search_terms", query);
    url.searchParams.set("search_simple", "1");
    url.searchParams.set("action", "process");
    url.searchParams.set("json", "1");
    url.searchParams.set("page_size", "12");
    url.searchParams.set("lc", language);
    url.searchParams.set(
      "fields",
      [
        "code",
        "product_name",
        "product_name_en",
        "product_name_nl",
        "product_name_de",
        "product_name_fr",
        "generic_name",
        "generic_name_en",
        "generic_name_nl",
        "generic_name_de",
        "generic_name_fr",
        "brands",
        "image_front_url",
        "nutriments",
      ].join(","),
    );

    let response: Response;

    try {
      response = await fetch(url.toString());
    } catch {
      throw new ApiError(502, "OPEN_FOOD_FACTS_NETWORK_ERROR", "The product service is temporarily unavailable.");
    }

    if (!response.ok) {
      throw new ApiError(502, "OPEN_FOOD_FACTS_ERROR", "The product service returned an unexpected response.");
    }

    const payload = (await response.json()) as OpenFoodFactsSearchResponse;
    return Array.isArray(payload.products) ? payload.products : [];
  }
}
