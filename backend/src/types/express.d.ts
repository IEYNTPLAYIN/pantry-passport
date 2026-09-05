import type { Subscription, User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      demoUser?: User & { subscription: Subscription | null };
    }
  }
}

export {};
