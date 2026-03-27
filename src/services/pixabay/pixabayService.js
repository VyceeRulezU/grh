/**
 * Pixabay Image Service
 * Fetches contextually relevant Nigerian/African governance images.
 * Results are cached in sessionStorage for 24 hours to respect rate limits.
 */

const PIXABAY_BASE = 'https://pixabay.com/api/';
const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

const CACHE_PREFIX = 'pixabay_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch images from Pixabay with a given query.
 * Automatically appends "african OR nigeria" for localization context.
 *
 * @param {string} query - Base search query (e.g. "governance professionals")
 * @param {object} options - Overrides: { per_page, image_type, orientation }
 * @returns {Promise<string[]>} Array of webformatURL image URLs
 */
export async function fetchPixabayImages(query, options = {}) {
  // Always add african/nigeria context
  const localizedQuery = `${query} african nigeria`;
  const cacheKey = `${CACHE_PREFIX}${localizedQuery}_${options.per_page || 6}`;

  // Check cache
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.urls;
      }
    }
  } catch (e) {
    // sessionStorage unavailable, proceed without cache
  }

  if (!API_KEY) {
    console.warn('[Pixabay] No API key found. Set VITE_PIXABAY_API_KEY in .env');
    return [];
  }

  const params = new URLSearchParams({
    key: API_KEY,
    q: localizedQuery,
    image_type: options.image_type || 'photo',
    orientation: options.orientation || 'horizontal',
    per_page: String(options.per_page || 6),
    safesearch: 'true',
    lang: 'en',
  });

  try {
    const response = await fetch(`${PIXABAY_BASE}?${params.toString()}`);
    if (!response.ok) throw new Error(`Pixabay API error: ${response.status}`);
    const data = await response.json();

    const urls = (data.hits || []).map(hit => hit.webformatURL);

    // Cache the result
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ urls, timestamp: Date.now() }));
    } catch (e) {
      // ignore storage errors
    }

    return urls;
  } catch (err) {
    console.error('[Pixabay] Fetch failed:', err);
    return [];
  }
}

/**
 * Pre-defined contextual queries for app sections.
 */
export const PIXABAY_QUERIES = {
  governance: 'government office meeting',
  finance: 'naira money finance government',
  integrity: 'justice law court africa',
  democracy: 'election voting africa',
  digital: 'technology computer africa office',
  library: 'library books learning africa',
  portraits: 'professional business portrait',
  sparc: 'government accountability africa',
  perl: 'public sector reform africa',
};
