import { mediaRepo } from "@/src/lib/db";

import { cleanupUnreferencedMediaFiles } from "./media-storage";

export async function cleanupOrphanedMedia(): Promise<number> {
  const uris = await mediaRepo.listStoredUris();
  return cleanupUnreferencedMediaFiles(new Set(uris));
}

