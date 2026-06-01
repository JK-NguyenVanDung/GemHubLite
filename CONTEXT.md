# GemHub Lite Context

## Glossary

### GemHub Lite

Simplified app for jewelry capture and cataloging. It preserves the capture-to-SKU-to-library mental model without production GemHub hardware, cloud, auth, editor, or integration surfaces.

### Real App

The production GemHub/GemIQ app observed through iPhone Mirroring for product and design-system research. It is a reference for patterns, not a source for proprietary assets or exact cloning.

### Product

Local inventory record identified primarily by SKU. A Product owns editable metadata and one or more Media Items.

### SKU

Required product identity used before any media save. In GemHub Lite, SKU is normalized, unique, and read-only after product creation for v1.

### Media Item

Saved photo attached to exactly one Product. GemHub Lite has no unassigned media bucket.

### Product Detail

SKU-centered workspace where the user edits product metadata and reviews or adds media for that Product.

### Media Area

Gallery-style browsing surface over all Media Items, with enough SKU/product context to navigate back to Product Detail.

### Products Area

Inventory browsing surface over Products, showing SKU, title or placeholder, cover image, and media count.

### Camera Area

Capture surface for still product photos. It can start from the main Camera tab or from Product Detail with SKU context.

### Capture Preview

Post-capture save gate where the user confirms or generates required SKU before media becomes durable inventory.

### Safe Lite Adaptation

Production-inspired pattern that improves GemHub Lite while staying inside current scope and avoiding proprietary assets, branding, hardware, cloud, or paid feature replication.

