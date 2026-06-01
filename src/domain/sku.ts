const GENERATED_SKU_PATTERN = /^GH-(\d+)$/;
const VALID_SKU_PATTERN = /^[A-Z0-9._-]+$/;

/**
 * Converts merchant-entered SKU text into canonical storage form.
 * Input may contain spaces or control characters; output is uppercase, trimmed, and space-delimited with `-`.
 * Invariant: supported punctuation (`-`, `_`, `.`) and alphanumerics remain unchanged except casing.
 * Example: `normalizeSku(" ab  12 ")` returns `AB-12`.
 */
export function normalizeSku(input: string): string {
  return input.replace(/[\u0000-\u001F\u007F]/g, "").trim().replace(/\s+/g, "-").toUpperCase();
}

/**
 * Checks whether SKU text can be safely used as product identity.
 * Input is normalized before validation, so callers may pass raw field text.
 * Invariant: normalized SKU length must be 1...64 and only contain `A-Z`, numbers, `.`, `_`, or `-`.
 * Example: `isValidSku(" ring 01 ")` returns `true`; `isValidSku("")` returns `false`.
 */
export function isValidSku(input: string): boolean {
  const sku = normalizeSku(input);
  return sku.length >= 1 && sku.length <= 64 && VALID_SKU_PATTERN.test(sku);
}

/**
 * Builds a stable local catalog SKU from the next inventory sequence.
 * Sequence is the only input so generation stays idempotent until a product is saved.
 * Invariant: sequence is padded to width 6, expanding naturally for values above 999999.
 * Example: `generateSku(7)` returns `GH-000007`.
 */
export function generateSku(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Generated SKU sequence must be a positive integer.");
  }

  const suffix = String(sequence).padStart(6, "0");

  return `GH-${suffix}`;
}

/**
 * Reads generated SKU metadata for the default `GH-######` path.
 * Input may be raw SKU text and is normalized before parsing.
 * Invariant: only generated SKU prefixes return metadata; manual SKUs return `null`.
 * Example: `parseGeneratedSku("gh-000007")` returns `{ sequence: 7 }`.
 */
export function parseGeneratedSku(sku: string): { sequence: number } | null {
  const match = normalizeSku(sku).match(GENERATED_SKU_PATTERN);

  if (!match) {
    return null;
  }

  return { sequence: Number(match[1]) };
}
