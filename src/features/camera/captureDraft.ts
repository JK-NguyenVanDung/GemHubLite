import type { ProductType } from "@/src/domain";
import type { CaptureMediaMetadata } from "@/src/features/camera/hooks/useCaptureSave";

/**
 * In-memory hand-off buffer for the capture review draft.
 *
 * Why this exists:
 * The capture review screen keeps its pending media list and form fields in
 * React component state. When the user taps "Add Photo with Camera" we leave
 * that screen to mount the full-screen camera, so the component state would be
 * lost. Serialising the whole draft (multiple file URIs + metadata) through
 * expo-router URL params is lossy and fragile, so instead we stash it in this
 * tiny module-level buffer and rehydrate it when review remounts.
 *
 * It is intentionally a single slot (not a stack): only one capture-to-review
 * round trip can be in flight at a time, matching the UI which only allows one
 * camera session at once.
 */
export type CaptureDraft = {
  sku: string;
  title: string;
  type: ProductType | null;
  description: string;
  media: (CaptureMediaMetadata & { uri: string })[];
};

let draft: CaptureDraft | null = null;

/** Store the current review draft before navigating to the camera. */
export function setCaptureDraft(next: CaptureDraft): void {
  draft = next;
}

/** Append a freshly captured asset to the in-flight draft, if one exists. */
export function appendCaptureDraftMedia(
  media: CaptureMediaMetadata & { uri: string },
): boolean {
  if (!draft) return false;
  draft = { ...draft, media: [...draft.media, media] };
  return true;
}

/** Read and clear the buffered draft (consume-once semantics). */
export function takeCaptureDraft(): CaptureDraft | null {
  const current = draft;
  draft = null;
  return current;
}

/** Drop any buffered draft without consuming it (e.g. on cancel/discard). */
export function clearCaptureDraft(): void {
  draft = null;
}
