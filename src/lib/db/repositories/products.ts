import { generateSku, isValidSku, normalizeSku, parseGeneratedSku } from "@/src/domain";
import type { Product, ProductListItem, ProductType } from "@/src/domain";

import { getDb } from "../client";

interface ProductRow {
  sku: string;
  title: string | null;
  type: ProductType | null;
  description: string | null;
  created_at: number;
  updated_at: number;
}

interface ProductListRow extends ProductRow {
  cover_uri: string | null;
  cover_kind: "image" | "video" | null;
  media_count: number;
}

export interface UpsertProductInput {
  sku: string;
  title?: string | null;
  type?: ProductType | null;
  description?: string | null;
}

export interface UpsertProductResult {
  product: Product;
  created: boolean;
}

function mapProduct(row: ProductRow): Product {
  return {
    sku: row.sku,
    title: row.title,
    type: row.type,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProductListItem(row: ProductListRow): ProductListItem {
  return {
    ...mapProduct(row),
    coverUri: row.cover_uri,
    coverKind: row.cover_kind,
    mediaCount: row.media_count,
  };
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length ? trimmed : null;
}

function validateSku(input: string): string {
  if (!isValidSku(input)) {
    throw new Error("SKU must contain 1-64 letters, numbers, dots, underscores, or dashes.");
  }

  return normalizeSku(input);
}

export const productsRepo = {
  /** Loads one product by normalized SKU, or `null` when missing. */
  async getBySku(sku: string): Promise<Product | null> {
    const db = await getDb();
    const normalizedSku = validateSku(sku);
    const row = await db.getFirstAsync<ProductRow>("SELECT * FROM products WHERE sku = ? LIMIT 1;", normalizedSku);

    return row ? mapProduct(row) : null;
  },

  /** Lists products newest-first with most recent media URI and media count for cards. */
  async list(): Promise<ProductListItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<ProductListRow>(
      `SELECT
        products.*,
        (
          SELECT media.uri
          FROM media
          WHERE media.sku = products.sku
          ORDER BY media.created_at DESC
          LIMIT 1
        ) AS cover_uri,
        (
          SELECT media.kind
          FROM media
          WHERE media.sku = products.sku
          ORDER BY media.created_at DESC
          LIMIT 1
        ) AS cover_kind,
        COUNT(media.id) AS media_count
      FROM products
      LEFT JOIN media ON media.sku = products.sku
      GROUP BY products.sku
      ORDER BY products.updated_at DESC;`,
    );

    return rows.map(mapProductListItem);
  },

  /** Creates product for new SKU or updates non-empty metadata for an existing SKU without duplicating rows. */
  async upsertBySku(input: UpsertProductInput): Promise<UpsertProductResult> {
    const db = await getDb();
    const sku = validateSku(input.sku);
    const existing = await productsRepo.getBySku(sku);

    if (existing) {
      const title = clean(input.title) ?? existing.title;
      const type = input.type ?? existing.type;
      const description = clean(input.description) ?? existing.description;

      if (title === existing.title && type === existing.type && description === existing.description) {
        return { product: existing, created: false };
      }

      const updatedAt = Date.now();
      await db.runAsync(
        "UPDATE products SET title = ?, type = ?, description = ?, updated_at = ? WHERE sku = ?;",
        title,
        type,
        description,
        updatedAt,
        sku,
      );

      return {
        product: { ...existing, title, type, description, updatedAt },
        created: false,
      };
    }

    const now = Date.now();

    await db.runAsync(
      "INSERT INTO products (sku, title, type, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?);",
      sku,
      clean(input.title),
      input.type ?? null,
      clean(input.description),
      now,
      now,
    );

    return {
      product: {
        sku,
        title: clean(input.title),
        type: input.type ?? null,
        description: clean(input.description),
        createdAt: now,
        updatedAt: now,
      },
      created: true,
    };
  },

  /** Compatibility wrapper for slices that only need product row. */
  async upsert(input: UpsertProductInput): Promise<Product> {
    const { product } = await productsRepo.upsertBySku(input);
    return product;
  },

  /** Updates editable product metadata and rejects missing SKU to protect capture links. */
  async update(sku: string, patch: { title?: string | null; type?: ProductType | null; description?: string | null }): Promise<Product> {
    const db = await getDb();
    const normalizedSku = validateSku(sku);
    const existing = await productsRepo.getBySku(normalizedSku);

    if (!existing) {
      throw new Error(`Product not found for SKU ${normalizedSku}.`);
    }

    const updated: Product = {
      ...existing,
      title: patch.title === undefined ? existing.title : clean(patch.title),
      type: patch.type === undefined ? existing.type : patch.type,
      description: patch.description === undefined ? existing.description : clean(patch.description),
      updatedAt: Date.now(),
    };

    await db.runAsync(
      "UPDATE products SET title = ?, type = ?, description = ?, updated_at = ? WHERE sku = ?;",
      updated.title,
      updated.type,
      updated.description,
      updated.updatedAt,
      normalizedSku,
    );

    return updated;
  },

  async deleteBySku(sku: string): Promise<Product | null> {
    const db = await getDb();
    const normalizedSku = validateSku(sku);
    const existing = await productsRepo.getBySku(normalizedSku);

    if (!existing) {
      return null;
    }

    await db.runAsync("DELETE FROM products WHERE sku = ?;", normalizedSku);

    return existing;
  },

  /** Returns next generated SKU sequence for local catalog path `GH-######`. */
  async nextSequence(): Promise<number> {
    const db = await getDb();
    const rows = await db.getAllAsync<{ sku: string }>(
      "SELECT sku FROM products WHERE sku LIKE ?;",
      "GH-%",
    );

    const maxSequence = rows.reduce((max, row) => {
      const sequence = parseGeneratedSku(row.sku)?.sequence ?? 0;
      return Number.isFinite(sequence) && sequence > max ? sequence : max;
    }, 0);

    return maxSequence + 1;
  },

  /** Builds next generated SKU for capture preview without reserving a row. */
  async generateNextSku(): Promise<string> {
    return generateSku(await productsRepo.nextSequence());
  },
};
