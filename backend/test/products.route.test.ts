import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { errorMiddleware } from "../src/lib/http.js";
import { createProductRoutes } from "../src/routes/products.routes.js";
import { ProductSearchService } from "../src/services/product-search.service.js";

describe("product routes", () => {
  it("rejects empty queries", async () => {
    const app = express();
    app.use((req, _res, next) => {
      req.demoUser = {
        id: "user-1",
        email: "demo@example.com",
      } as never;
      req.requestId = "req-1";
      next();
    });
    app.use("/api/products", createProductRoutes(new ProductSearchService({
      foodFactsService: { searchProducts: () => Promise.resolve([]) },
      searchHistoryService: {
        recordSearch: () => Promise.resolve({
          id: "history-1",
          userId: "user-1",
          query: "search",
          normalizedQuery: "search",
          language: "en",
          resultCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
      subscriptionService: {
        getSummary: () => Promise.resolve({
          status: "CANCELED",
          isActive: false,
          canAccessNutrition: false,
        }),
      },
    })));
    app.use(errorMiddleware);

    const response = await request(app).get("/api/products/search?q=&lang=en");
    const body = response.body as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});
