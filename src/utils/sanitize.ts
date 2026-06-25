const MAX_SEARCH_LENGTH = 100

/** Strips HTML tags, removes control characters, and enforces a max length on user search input. */
export function sanitizeSearchInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, MAX_SEARCH_LENGTH)
}
