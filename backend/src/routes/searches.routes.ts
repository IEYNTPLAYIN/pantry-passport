import { Router } from "express";

import { asyncHandler } from "../lib/http.js";
import { recentSearchesQuerySchema } from "../lib/validation.js";
import type { SearchHistoryService } from "../services/search-history.service.js";

export function createSearchesRoutes(searchHistoryService: SearchHistoryService) {
  const router = Router();

  router.get(
    "/recent",
    asyncHandler(async (request, response) => {
      const { limit } = recentSearchesQuerySchema.parse(request.query);
      const recentSearches = await searchHistoryService.getRecentSearches(request.demoUser!.id, limit);
      response.json({
        searches: recentSearches,
      });
    }),
  );

  return router;
}
