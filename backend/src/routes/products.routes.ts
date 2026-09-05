import { Router } from "express";

import { asyncHandler } from "../lib/http.js";
import { searchQuerySchema } from "../lib/validation.js";
import type { ProductSearchService } from "../services/product-search.service.js";

export function createProductRoutes(productSearchService: ProductSearchService) {
  const router = Router();

  router.get(
    "/search",
    asyncHandler(async (request, response) => {
      const { q, lang } = searchQuerySchema.parse(request.query);
      const result = await productSearchService.search(request.demoUser!.id, q, lang);
      response.json(result);
    }),
  );

  return router;
}
