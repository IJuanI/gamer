export type FormError = Record<string, string>;

export function extractFieldError(errors: FormError, field: string): string | undefined {
  return errors[field];
}

export function hasFormErrors(errors: FormError): boolean {
  return Object.keys(errors).length > 0;
}

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+(\.[^\s@]+)?$/;
  return regex.test(email);
}

export function normalizeFormError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as any).message;
  }
  return "Algo salió mal. Por favor, intenta de nuevo.";
}

export function tryParseJSON(json: string): Record<string, any> | null {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
