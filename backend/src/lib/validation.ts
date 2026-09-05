import { z } from "zod";

import { supportedLanguages } from "../types/language.js";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(80),
  lang: z.enum(supportedLanguages).default("en"),
});

export const recentSearchesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(6),
});
