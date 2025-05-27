export function extractIdentifiers(query: string): string[] {
  // Match alphanumeric strings of length ≥4 that contain at least one digit
  const matches = query.match(/\b[A-Za-z0-9]{4,}\b/g) || [];
  const identifiers = matches.filter((token) => /\d/.test(token));
  // Return unique, case-insensitive list preserving original casing of first occurrence
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of identifiers) {
    const lower = id.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(id);
    }
  }
  return result;
}

/**
 * Filter a list of text chunks so that at least one of the identifiers is present.
 * If no identifiers are supplied or no chunks match, the original list is returned.
 */
export function filterChunksByIdentifiers<T extends { chunk_text?: string; content?: string }>(
  chunks: T[] | undefined,
  identifiers: string[],
): T[] | undefined {
  if (!chunks || chunks.length === 0 || identifiers.length === 0) return chunks;

  const loweredIds = identifiers.map((id) => id.toLowerCase());
  const filtered = chunks.filter((chunk) => {
    const text = (chunk as any).chunk_text ?? (chunk as any).content ?? '';
    const lowerText = String(text).toLowerCase();
    return loweredIds.some((id) => lowerText.includes(id));
  });

  return filtered.length > 0 ? filtered : chunks;
} 