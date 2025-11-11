export const apiVersionPrefix = (() => {
  const raw = (import.meta.env.VITE_API_VERSION as string | undefined) ?? '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  // Normalize: remove leading/trailing slashes (we will join later)
  return trimmed.replace(/^\/+|\/+$/g, '');
})();

export const apiPath = (path: string) => {
  // Return RELATIVE path (no leading slash) so axios baseURL path (e.g., /api) is preserved
  const normalized = path.replace(/^\/+/, '');
  return apiVersionPrefix ? `${apiVersionPrefix}/${normalized}` : normalized;
};
