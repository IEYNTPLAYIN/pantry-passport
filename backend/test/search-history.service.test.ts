import { describe, expect, it, vi } from "vitest";

import { SearchHistoryService } from "../src/services/search-history.service.js";

describe("SearchHistoryService", () => {
  it("avoids noisy duplicate searches within the dedupe window", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: "existing",
    });
    const create = vi.fn();

    const service = new SearchHistoryService({
      searchHistory: {
        findFirst,
        create,
        findMany: vi.fn(),
      },
    } as never);

    await service.recordSearch("user-1", "Pasta", "en", 4);

    expect(findFirst).toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("returns recent searches in descending order", async () => {
    const findMany = vi.fn().mockResolvedValue([
      { id: "1", query: "Pasta", language: "en", createdAt: new Date("2026-09-04T00:00:00.000Z") },
    ]);
    const service = new SearchHistoryService({
      searchHistory: {
        findFirst: vi.fn(),
        create: vi.fn(),
        findMany,
      },
    } as never);

    const results = await service.getRecentSearches("user-1", 6);
    expect(results).toHaveLength(1);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      }),
    );
  });
});
