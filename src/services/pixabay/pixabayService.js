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
 * @param {object} options - { per_page, image_type, orientation, documentFocus }
 * @returns {Promise<string[]>} Array of webformatURL image URLs
 */
export async function fetchPixabayImages(query, options = {}) {
  // Always add african/nigeria context
  let localizedQuery = `${query} african nigeria`;
  
  // Enhancement: steer towards documents/office if focus is enabled
  if (options.documentFocus) {
    localizedQuery = `${query} african nigeria document report paper office professional official`;
  }

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
    let hits = data.hits || [];

    // Filtering: Exclude irrelevant imagery (wildlife, animals, nature landscapes) if documentFocus is active
    if (options.documentFocus) {
      const EXCLUDE_TAGS = ['animal', 'wildlife', 'nature', 'zoo', 'tree', 'forest', 'landscape', 'field', 'safari', 'lion', 'elephant'];
      hits = hits.filter(hit => {
        const tags = (hit.tags || '').toLowerCase();
        return !EXCLUDE_TAGS.some(tag => tags.includes(tag));
      });
    }

    let urls = hits.map(hit => hit.webformatURL);

    // Fallback logic: if we have NO hits after filtering, try category fallback
    if (urls.length === 0) {
      const fallbackSet = PIXABAY_FALLBACKS[query] || PIXABAY_FALLBACKS.general;
      urls = fallbackSet;
    }

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

/**
 * High-quality fallback pools for when Pixabay returns irrelevant or zero results.
 * These ensure a premium look even if specific localized imagery is missing.
 */
export const PIXABAY_FALLBACKS = {
  governance: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80'
  ],
  finance: [
    'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543286386-713bcd549651?auto=format&fit=crop&w=800&q=80'
  ],
  library: [
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507733440662-10124dfb7272?auto=format&fit=crop&w=800&q=80'
  ],
  general: [
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  ]
};
// Map aliases
PIXABAY_FALLBACKS.sparc = PIXABAY_FALLBACKS.governance;
PIXABAY_FALLBACKS.perl = PIXABAY_FALLBACKS.governance;
PIXABAY_FALLBACKS.integrity = PIXABAY_FALLBACKS.governance;
