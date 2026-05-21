/**
 * Pexels Image Service
 * Fetches contextually relevant high-quality African/Nigerian images.
 * Results are cached in sessionStorage for 24 hours to respect rate limits.
 */

const PEXELS_BASE = 'https://api.pexels.com/v1/search';
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;

const CACHE_PREFIX = 'pexels_cache_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Pre-defined contextual queries for specific app components.
 */
export const PEXELS_QUERIES = {
  // Testimonial avatars: African people profile pictures
  avatars: 'african person portrait face headshot',
  
  // Mission section: High-quality professional/educational/governance image relating to the section
  mission: 'african government office collaboration meeting professional',
  
  // Why Partner with Us: Bento box images
  partner_practitioner: 'african professional office working portrait',
  partner_focus: 'african cooperation handshake partnership meeting',
  partner_author: 'african professional woman headshot',
};

/**
 * Premium fallback images from Unsplash to ensure the UI looks stellar
 * even if the Pexels API fails or exceeds its rate limits.
 */
export const PEXELS_FALLBACKS = {
  avatars: [
    'https://images.unsplash.com/photo-1531123897727-8f129e1ebaaa?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80',
  ],
  mission: [
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800'
  ],
  partner_practitioner: [
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800'
  ],
  partner_focus: [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600'
  ],
  partner_author: [
    'https://images.unsplash.com/photo-1531123897727-8f129e1ebaaa?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80'
  ]
};

/**
 * Fetch images from Pexels with a given query key.
 *
 * @param {string} queryKey - Key from PEXELS_QUERIES (e.g. 'avatars', 'mission')
 * @param {object} options - { per_page, orientation }
 * @returns {Promise<string[]>} Array of image URLs
 */
export async function fetchPexelsImages(queryKey, options = {}) {
  const query = PEXELS_QUERIES[queryKey] || queryKey;
  const perPage = options.per_page || 10;
  
  const cacheKey = `${CACHE_PREFIX}${queryKey}_${perPage}`;

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
    // sessionStorage unavailable
  }

  if (!API_KEY) {
    console.warn('[Pexels] No API key found. Set VITE_PEXELS_API_KEY in .env');
    return PEXELS_FALLBACKS[queryKey] || [];
  }

  const params = new URLSearchParams({
    query: query,
    per_page: String(perPage),
    orientation: options.orientation || 'portrait',
  });

  try {
    const response = await fetch(`${PEXELS_BASE}?${params.toString()}`, {
      headers: {
        Authorization: API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();
    const photos = data.photos || [];
    
    // Choose appropriate size (medium/large depending on query)
    const urls = photos.map(photo => {
      if (queryKey === 'avatars' || queryKey === 'partner_author') {
        return photo.src.medium || photo.src.large;
      }
      return photo.src.large2x || photo.src.large || photo.src.original;
    });

    if (urls.length === 0) {
      return PEXELS_FALLBACKS[queryKey] || [];
    }

    // Cache the result
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ urls, timestamp: Date.now() }));
    } catch (e) {
      // ignore storage errors
    }

    return urls;
  } catch (err) {
    console.error('[Pexels] Fetch failed:', err);
    return PEXELS_FALLBACKS[queryKey] || [];
  }
}
