import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError } from "./errors.js";

export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    void handler(request, response, next).catch(next);
  };
}

export function errorMiddleware(error: unknown, request: Request, response: Response, _next: NextFunction) {
  void _next;

  if (error instanceof ZodError) {
    const fieldErrors = error.flatten().fieldErrors;
    response.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "The request is invalid.",
        fieldErrors,
        requestId: request.requestId,
      },
    });
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        fieldErrors: error.fieldErrors,
        requestId: request.requestId,
      },
    });
    return;
  }

  console.error(`[${request.requestId}] Unhandled error`, error);
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong on the server.",
      requestId: request.requestId,
    },
  });
}
