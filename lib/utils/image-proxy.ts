/**
 * Image Proxy Utilities
 * Proxies TMDB images through wsrv.nl with 3 weeks caching
 */

const WSRV_BASE = 'https://wsrv.nl';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const CACHE_DURATION = 3 * 7 * 24 * 60 * 60; // 3 weeks in seconds

export type ImageSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
export type BackdropSize = 'w300' | 'w780' | 'w1280' | 'original';
export type ProfileSize = 'w45' | 'w185' | 'h632' | 'original';

/**
 * Generate a proxied image URL through wsrv.nl with caching
 * @param path - TMDB image path (e.g., "/abc123.jpg")
 * @param size - Image size
 * @param width - Optional custom width
 * @param height - Optional custom height
 */
export function getProxiedImageUrl(
  path: string | null,
  size: ImageSize | BackdropSize | ProfileSize = 'original',
  width?: number,
  height?: number
): string {
  if (!path) {
    return '/placeholder.svg'; // Fallback placeholder
  }

  const imageUrl = `${TMDB_IMAGE_BASE}/${size}${path}`;
  const params = new URLSearchParams({
    url: imageUrl,
    maxage: CACHE_DURATION.toString(),
    ...(width && { w: width.toString() }),
    ...(height && { h: height.toString() }),
  });

  return `${WSRV_BASE}?${params.toString()}`;
}

/**
 * Get poster image URL with proxy
 */
export function getPosterUrl(
  path: string | null,
  size: ImageSize = 'w500',
  width?: number
): string {
  return getProxiedImageUrl(path, size, width);
}

/**
 * Get backdrop image URL with proxy
 */
export function getBackdropUrl(
  path: string | null,
  size: BackdropSize = 'w1280',
  width?: number
): string {
  return getProxiedImageUrl(path, size, width);
}

/**
 * Get profile image URL with proxy
 */
export function getProfileUrl(
  path: string | null,
  size: ProfileSize = 'w185',
  width?: number
): string {
  return getProxiedImageUrl(path, size, width);
}

/**
 * Get logo image URL with proxy
 */
export function getLogoUrl(
  path: string | null,
  size: BackdropSize = 'w300',
  width?: number
): string {
  return getProxiedImageUrl(path, size, width);
}
