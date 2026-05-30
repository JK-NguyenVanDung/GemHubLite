export const SCHEMA_VERSION = 2;

export const SCHEMA_V1 = `
CREATE TABLE IF NOT EXISTS products (
  sku TEXT PRIMARY KEY,
  title TEXT,
  type TEXT,
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL REFERENCES products(sku) ON DELETE CASCADE,
  uri TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_sku_created_at ON media(sku, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);
`;

export const SCHEMA_V2 = `
ALTER TABLE media ADD COLUMN kind TEXT NOT NULL DEFAULT 'image';
ALTER TABLE media ADD COLUMN mime_type TEXT;
ALTER TABLE media ADD COLUMN original_bytes INTEGER;
ALTER TABLE media ADD COLUMN stored_bytes INTEGER;
ALTER TABLE media ADD COLUMN width INTEGER;
ALTER TABLE media ADD COLUMN height INTEGER;
ALTER TABLE media ADD COLUMN duration_ms INTEGER;
ALTER TABLE media ADD COLUMN compressed INTEGER NOT NULL DEFAULT 0;
`;
