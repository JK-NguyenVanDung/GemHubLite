import assert from "node:assert/strict";
import test from "node:test";

import { generateSku, isValidSku, normalizeSku, parseGeneratedSku } from "../src/domain/sku.ts";

test("normalizeSku matches SKU field and scanner canonical form", () => {
  assert.equal(normalizeSku(" un-0008 "), "UN-0008");
  assert.equal(normalizeSku("sku 001"), "SKU-001");
});

test("manual and scanned SKUs use safe catalog identity characters", () => {
  assert.equal(isValidSku("UN-0008"), true);
  assert.equal(isValidSku("SKU_001.A"), true);
  assert.equal(isValidSku(""), false);
  assert.equal(isValidSku("SKU/001"), false);
});

test("generated SKU is deterministic, padded, and parseable", () => {
  const sku = generateSku(8);

  assert.equal(sku, "GH-000008");
  assert.deepEqual(parseGeneratedSku(sku), { sequence: 8 });
});
