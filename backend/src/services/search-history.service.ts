import type { PrismaClient } from "@prisma/client";

import type { SupportedLanguage } from "../types/language.js";

const duplicateWindowMinutes = 10;

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ").toLowerCase();
}

export class SearchHistoryService {
  constructor(private readonly prisma: Pick<PrismaClient, "searchHistory">) {}

  async recordSearch(userId: string, query: string, language: SupportedLanguage, resultCount: number) {
    const normalizedQuery = normalizeQuery(query);
    const duplicateThreshold = new Date(Date.now() - duplicateWindowMinutes * 60 * 1000);

    const existing = await this.prisma.searchHistory.findFirst({
      where: {
        userId,
        normalizedQuery,
        language,
        createdAt: {
          gte: duplicateThreshold,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.searchHistory.create({
      data: {
        userId,
        query: query.trim(),
        normalizedQuery,
        language,
        resultCount,
      },
    });
  }

  async getRecentSearches(userId: string, limit: number) {
    return this.prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        query: true,
        language: true,
        createdAt: true,
      },
    });
  }
}
