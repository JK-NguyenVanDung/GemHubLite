import { Directory, File, Paths } from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export type StoredAssetKind = "image" | "video";

export type StoreMediaAssetInput = {
  uri: string;
  kind: StoredAssetKind;
  width?: number | null;
  height?: number | null;
  durationMs?: number | null;
  mimeType?: string | null;
  filenameHint?: string | null;
};

export type StoredMediaAsset = {
  uri: string;
  kind: StoredAssetKind;
  mimeType: string;
  originalBytes: number | null;
  storedBytes: number | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  compressed: boolean;
};

const IMAGE_MAX_EDGE = 1600;
const IMAGE_JPEG_QUALITY = 0.86;

const mediaDirectory = new Directory(Paths.document, "media");
const imageDirectory = new Directory(mediaDirectory, "images");
const videoDirectory = new Directory(mediaDirectory, "videos");

export const MEDIA_DIR = mediaDirectory.uri;
export const IMAGE_MEDIA_DIR = imageDirectory.uri;
export const VIDEO_MEDIA_DIR = videoDirectory.uri;

/** Ensures persistent media directories exist before camera slices copy files into them. */
export async function ensureMediaDir(): Promise<void> {
  for (const directory of [mediaDirectory, imageDirectory, videoDirectory]) {
    if (!directory.exists) {
      directory.create({ idempotent: true, intermediates: true });
    }
  }
}

/** Builds absolute app-document media URI for a safe filename and asset kind. */
export function buildMediaUri(filename: string, kind: StoredAssetKind = "image"): string {
  return new File(kind === "video" ? videoDirectory : imageDirectory, filename).uri;
}

/** Stores a picked/captured asset in app-owned storage; images are downscaled + JPEG-compressed. */
export async function storeMediaAsset(input: StoreMediaAssetInput): Promise<StoredMediaAsset> {
  if (input.kind === "video") {
    return storeVideoAsset(input);
  }

  return storeImageAsset(input);
}

/** Backward-compatible image copy path used by existing capture code. */
export async function copyIntoMediaDir(srcUri: string, _ext: string): Promise<string> {
  const stored = await storeImageAsset({ uri: srcUri, kind: "image" });
  return stored.uri;
}

async function storeImageAsset(input: StoreMediaAssetInput): Promise<StoredMediaAsset> {
  await ensureMediaDir();

  const original = toFile(input.uri);
  const originalBytes = fileSize(original);
  const actions = buildResizeActions(input.width, input.height);
  const compressed = await manipulateAsync(input.uri, actions, {
    compress: IMAGE_JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });
  const tempFile = toFile(compressed.uri);
  const destination = new File(imageDirectory, buildFilename("image", "jpg", input.filenameHint));

  await tempFile.copy(destination, { overwrite: false });

  return {
    uri: destination.uri,
    kind: "image",
    mimeType: "image/jpeg",
    originalBytes,
    storedBytes: fileSize(destination),
    width: compressed.width ?? input.width ?? null,
    height: compressed.height ?? input.height ?? null,
    durationMs: null,
    compressed: true,
  };
}

async function storeVideoAsset(input: StoreMediaAssetInput): Promise<StoredMediaAsset> {
  await ensureMediaDir();

  const source = toFile(input.uri);
  const ext = extensionFromUri(input.uri, input.mimeType) || "mp4";
  const destination = new File(videoDirectory, buildFilename("video", ext, input.filenameHint));
  const originalBytes = fileSize(source);

  await source.copy(destination, { overwrite: false });

  return {
    uri: destination.uri,
    kind: "video",
    mimeType: input.mimeType ?? mimeTypeForExtension(ext, "video/mp4"),
    originalBytes,
    storedBytes: fileSize(destination),
    width: input.width ?? null,
    height: input.height ?? null,
    durationMs: input.durationMs ?? null,
    compressed: false,
  };
}

function buildResizeActions(width?: number | null, height?: number | null) {
  if (!width || !height || Math.max(width, height) <= IMAGE_MAX_EDGE) {
    return [];
  }

  return width >= height ? [{ resize: { width: IMAGE_MAX_EDGE } }] : [{ resize: { height: IMAGE_MAX_EDGE } }];
}

function buildFilename(kind: StoredAssetKind, ext: string, hint?: string | null): string {
  const safeHint = hint?.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  const prefix = safeHint || kind;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext.replace(/^\.+/, "").toLowerCase()}`;
}

function toFile(uri: string): File {
  return new File(uri.startsWith("file://") ? uri : `file://${uri}`);
}

function fileSize(file: File): number | null {
  const candidate = file as File & { size?: unknown };
  return typeof candidate.size === "number" ? candidate.size : null;
}

function extensionFromUri(uri: string, mimeType?: string | null): string | null {
  const uriExt = uri.split("?")[0]?.split(".").pop()?.toLowerCase();
  if (uriExt && /^[a-z0-9]{2,5}$/.test(uriExt)) return uriExt;
  if (!mimeType) return null;
  return mimeType.split("/").pop()?.replace("quicktime", "mov") ?? null;
}

function mimeTypeForExtension(ext: string, fallback: string): string {
  if (ext === "mov") return "video/quicktime";
  if (ext === "m4v") return "video/x-m4v";
  if (ext === "webm") return "video/webm";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  return fallback;
}
