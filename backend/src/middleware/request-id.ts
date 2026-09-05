import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export function requestIdMiddleware(request: Request, _response: Response, next: NextFunction) {
  request.requestId = randomUUID();
  next();
}
