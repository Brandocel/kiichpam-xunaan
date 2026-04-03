export function buildMediaUrl(path?: string): string {
  if (!path) return "";

  if (path.startsWith("http")) return path;

  return `https://kiichpam-api-jpuw6.ondigitalocean.app${path}`;
}