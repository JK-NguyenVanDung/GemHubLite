import { normalizeSku, type Media, type Product, type ProductType } from "@/src/domain";

import { getDb } from "../client";
import { mediaRepo, type AppendMediaInput } from "./media";
import { productsRepo } from "./products";

export interface SaveCaptureInput extends Omit<AppendMediaInput, "sku"> {
  sku: string;
  title?: string | null;
  type?: ProductType | null;
  description?: string | null;
}

export interface SaveCaptureResult {
  product: Product;
  media: Media;
  created: boolean;
}

export async function saveCaptureAtomically(input: SaveCaptureInput): Promise<SaveCaptureResult> {
  const db = await getDb();
  let result: SaveCaptureResult | null = null;
  const sku = normalizeSku(input.sku);

  await db.withTransactionAsync(async () => {
    const { product, created } = await productsRepo.upsertBySku({
      sku,
      title: input.title,
      type: input.type,
      description: input.description,
    });
    const media = await mediaRepo.appendTrusted({ ...input, sku: product.sku });

    result = { product, media, created };
  });

  if (!result) {
    throw new Error("Save failed. Try again.");
  }

  return result;
}

