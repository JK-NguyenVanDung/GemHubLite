const GENERATED_SKU_PATTERN = /^SKU-(\d{8})-(\d+)$/;
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
 * Builds a local generated SKU for current capture day and sequence.
 * Input date uses local timezone fields to match merchant capture day; sequence must be positive.
 * Invariant: sequence is padded to width 3, expanding naturally for values above 999.
 * Example: `generateSku(new Date(2026, 0, 2), 7)` returns `SKU-20260102-007`.
 */
export function generateSku(date: Date, sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Generated SKU sequence must be a positive integer.");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const suffix = String(sequence).padStart(3, "0");

  return `SKU-${year}${month}${day}-${suffix}`;
}

/**
 * Reads generated SKU metadata for the default `SKU-YYYYMMDD-###` path.
 * Input may be raw SKU text and is normalized before parsing.
 * Invariant: only generated SKU prefixes return metadata; manual SKUs return `null`.
 * Example: `parseGeneratedSku("sku-20260102-007")` returns `{ date: "20260102", sequence: 7 }`.
 */
export function parseGeneratedSku(sku: string): { date: string; sequence: number } | null {
  const match = normalizeSku(sku).match(GENERATED_SKU_PATTERN);

  if (!match) {
    return null;
  }

  return { date: match[1], sequence: Number(match[2]) };
}
