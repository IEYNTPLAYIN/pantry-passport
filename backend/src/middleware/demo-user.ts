import type { PrismaClient } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../lib/errors.js";

export function createDemoUserMiddleware(prisma: PrismaClient, demoUserEmail: string) {
  return async function demoUserMiddleware(request: Request, _response: Response, next: NextFunction) {
    const user = await prisma.user.findUnique({
      where: { email: demoUserEmail },
      include: { subscription: true },
    });

    if (!user) {
      next(new ApiError(500, "DEMO_USER_NOT_FOUND", "The demo user has not been seeded."));
      return;
    }

    request.demoUser = user;
    next();
  };
}
