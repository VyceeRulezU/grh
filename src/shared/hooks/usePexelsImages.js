import { useState, useEffect, useRef } from 'react';
import { fetchPexelsImages, PEXELS_FALLBACKS } from '../../services/pexels/pexelsService';

/**
 * usePexelsImages
 * React hook that fetches a pool of images from Pexels using a pre-defined queryKey.
 * Returns an array of image URLs, a loading state, and a helper to pick one by index.
 *
 * Usage:
 *   const { getImage, images } = usePexelsImages('mission', 1);
 *   <img src={getImage(0)} />
 *
 * @param {string} queryKey - Key from PEXELS_QUERIES (e.g. 'avatars', 'mission')
 * @param {number} count - Number of images to fetch
 * @param {object} options - Options to pass to pexelsService (e.g. { orientation: 'landscape' })
 */
export function usePexelsImages(queryKey = 'mission', count = 5, options = {}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const stableKey = `${queryKey}_${count}_${options.orientation || ''}`;
  const fetchedRef = useRef('');

  useEffect(() => {
    if (fetchedRef.current === stableKey) return;
    fetchedRef.current = stableKey;

    const fetchOptions = {
      per_page: count,
      ...options
    };

    fetchPexelsImages(queryKey, fetchOptions)
      .then(urls => {
        setImages(urls);
      })
      .catch(() => {
        setImages(PEXELS_FALLBACKS[queryKey] || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [stableKey]);

  /**
   * Get an image by index, cycling through available images.
   * Falls back to the first fallback URL if no images are available.
   */
  const getImage = (index = 0) => {
    if (images.length === 0) {
      const fallbacks = PEXELS_FALLBACKS[queryKey] || [];
      return fallbacks[index % fallbacks.length] || '';
    }
    return images[index % images.length];
  };

  return { images, getImage, loading };
}

/**
 * usePexelsAvatars
 * Specialized hook for fetching African people profile pictures.
 *
 * @param {number} count - Number of avatars to fetch
 */
export function usePexelsAvatars(count = 6) {
  return usePexelsImages('avatars', count, { orientation: 'portrait' });
}
