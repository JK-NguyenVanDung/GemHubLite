const technicalPatterns = [/sqlite/i, /database/i, /filesystem/i, /file system/i, /enoent/i, /eacces/i];

export function toUserFacingError(error: unknown, fallback: string): Error {
  if (!(error instanceof Error)) {
    return new Error(fallback);
  }

  if (technicalPatterns.some((pattern) => pattern.test(error.message))) {
    return new Error(fallback);
  }

  return error;
}

