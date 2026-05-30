export type Sku = string;
export type MediaKind = "image" | "video";

export type ProductType = "ring" | "necklace" | "earring" | "bracelet" | "pendant" | "other";

export const productTypes: ProductType[] = ["ring", "necklace", "earring", "bracelet", "pendant", "other"];

export interface Product {
  sku: Sku;
  title: string | null;
  type: ProductType | null;
  description: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Media {
  id: string;
  sku: Sku;
  uri: string;
  kind: MediaKind;
  mimeType: string | null;
  originalBytes: number | null;
  storedBytes: number | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  compressed: boolean;
  createdAt: number;
}

export interface ProductListItem extends Product {
  coverUri: string | null;
  coverKind: MediaKind | null;
  mediaCount: number;
}

export interface MediaListItem extends Media {
  productTitle: string | null;
  productType: ProductType | null;
}

export type ProductPatch = Pick<Product, "title" | "type" | "description">;

/** Returns merchant-facing label for supported Lite product categories. */
export function productTypeLabel(type: ProductType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}
