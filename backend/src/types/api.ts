export type FieldErrorMap = Record<string, string[]>;

export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    fieldErrors?: FieldErrorMap;
    requestId: string;
  };
};
