import { SubscriptionStatus } from "@prisma/client";

import { getEnv } from "../src/config/env.js";
import { createPrismaClient } from "../src/lib/prisma.js";

async function main() {
  const env = getEnv();
  const prisma = createPrismaClient(env.DATABASE_URL);

  try {
    const user = await prisma.user.upsert({
      where: { email: env.DEMO_USER_EMAIL },
      update: {
        name: env.DEMO_USER_NAME,
        preferredLanguage: "en",
      },
      create: {
        email: env.DEMO_USER_EMAIL,
        name: env.DEMO_USER_NAME,
        preferredLanguage: "en",
      },
    });

    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        status: SubscriptionStatus.CANCELED,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
