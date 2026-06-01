import { isValidSku, normalizeSku } from "@/src/domain";
import type { Media, MediaKind, MediaListItem, ProductType } from "@/src/domain";

import { getDb } from "../client";
import { productsRepo } from "./products";

interface MediaRow {
  id: string;
  sku: string;
  uri: string;
  kind: MediaKind;
  mime_type: string | null;
  original_bytes: number | null;
  stored_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  compressed: number;
  created_at: number;
}

interface MediaListRow extends MediaRow {
  product_title: string | null;
  product_type: ProductType | null;
}

export class ProductNotFoundError extends Error {
  constructor(sku: string) {
    super(`Product not found for SKU ${sku}.`);
    this.name = "ProductNotFoundError";
  }
}

export interface AppendMediaInput {
  sku: string;
  uri: string;
  kind?: MediaKind;
  mimeType?: string | null;
  originalBytes?: number | null;
  storedBytes?: number | null;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  compressed?: boolean;
}

function mapMedia(row: MediaRow): Media {
  return {
    id: row.id,
    sku: row.sku,
    uri: row.uri,
    kind: row.kind ?? "image",
    mimeType: row.mime_type,
    originalBytes: row.original_bytes,
    storedBytes: row.stored_bytes,
    width: row.width,
    height: row.height,
    durationMs: row.duration_ms,
    compressed: Boolean(row.compressed),
    createdAt: row.created_at,
  };
}

function mapMediaListItem(row: MediaListRow): MediaListItem {
  return {
    ...mapMedia(row),
    productTitle: row.product_title,
    productType: row.product_type,
  };
}

function randomUuid(): string {
  const bytes = new Uint8Array(16);
  const cryptoSource = globalThis.crypto;

  if (cryptoSource?.getRandomValues) {
    cryptoSource.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

function validateSku(input: string): string {
  const sku = normalizeSku(input);
  if (!isValidSku(sku)) {
    throw new Error("SKU is required.");
  }

  return sku;
}

function buildMedia(input: AppendMediaInput, sku: string, now = Date.now()): Media {
  return {
    id: randomUuid(),
    sku,
    uri: input.uri,
    kind: input.kind ?? "image",
    mimeType: input.mimeType ?? null,
    originalBytes: input.originalBytes ?? null,
    storedBytes: input.storedBytes ?? null,
    width: input.width ?? null,
    height: input.height ?? null,
    durationMs: input.durationMs ?? null,
    compressed: input.compressed ?? false,
    createdAt: now,
  };
}

async function insertMedia(input: AppendMediaInput): Promise<Media> {
  const db = await getDb();
  const sku = validateSku(input.sku);
  const existing = await db.getFirstAsync<MediaRow>("SELECT * FROM media WHERE sku = ? AND uri = ? LIMIT 1;", sku, input.uri);

  if (existing) {
    await db.runAsync("UPDATE products SET updated_at = ? WHERE sku = ?;", Date.now(), sku);
    return mapMedia(existing);
  }

  const media = buildMedia(input, sku);

  await db.runAsync(
    `INSERT INTO media (
      id, sku, uri, kind, mime_type, original_bytes, stored_bytes, width, height, duration_ms, compressed, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    media.id,
    media.sku,
    media.uri,
    media.kind,
    media.mimeType,
    media.originalBytes,
    media.storedBytes,
    media.width,
    media.height,
    media.durationMs,
    media.compressed ? 1 : 0,
    media.createdAt,
  );
  await db.runAsync("UPDATE products SET updated_at = ? WHERE sku = ?;", media.createdAt, media.sku);

  return media;
}

export const mediaRepo = {
  /** Appends copied media URI to an existing product, rejecting orphan rows before SQLite FK runs. */
  async appendMedia(input: AppendMediaInput): Promise<Media> {
    const sku = validateSku(input.sku);
    const product = await productsRepo.getBySku(sku);

    if (!product) {
      throw new ProductNotFoundError(sku);
    }

    return insertMedia({ ...input, sku });
  },

  async appendTrusted(input: AppendMediaInput): Promise<Media> {
    return insertMedia(input);
  },

  /** Compatibility wrapper for product-detail/camera handoff naming. */
  async append(input: AppendMediaInput): Promise<Media> {
    return mediaRepo.appendMedia(input);
  },

  /** Lists every media item newest-first with product title for the gallery view. */
  async listAll(): Promise<MediaListItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<MediaListRow>(
      `SELECT media.*, products.title AS product_title, products.type AS product_type
       FROM media
       INNER JOIN products ON products.sku = media.sku
       ORDER BY media.created_at DESC, media.id DESC;`,
    );

    return rows.map(mapMediaListItem);
  },

  /** Lists media newest-first for one normalized product SKU. */
  async listForSku(sku: string): Promise<Media[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<MediaRow>("SELECT * FROM media WHERE sku = ? ORDER BY created_at DESC;", normalizeSku(sku));

    return rows.map(mapMedia);
  },

  async listStoredUris(): Promise<string[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ uri: string }>("SELECT uri FROM media;");

    return rows.map((row) => row.uri);
  },

  /** Delete stays outside v1 scope; detail/camera slices should not call it yet. */
  async deleteById(_id: string): Promise<void> {
    throw new Error("Deleting media is not implemented in v1.");
  },
};
