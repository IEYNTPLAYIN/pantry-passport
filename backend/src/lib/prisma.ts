import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

export function createPrismaClient(databaseUrl: string) {
  return new PrismaClient({
    adapter: new PrismaMariaDb(databaseUrl),
  });
}
