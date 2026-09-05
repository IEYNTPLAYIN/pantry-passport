import type { FieldErrorMap } from "../types/api.js";

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly fieldErrors: FieldErrorMap | undefined;

  constructor(statusCode: number, code: string, message: string, fieldErrors?: FieldErrorMap) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }
}
