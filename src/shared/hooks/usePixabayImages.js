import { useState, useEffect, useRef } from 'react';
import { fetchPixabayImages, PIXABAY_QUERIES } from '../../services/pixabay/pixabayService';

/**
 * usePixabayImages
 * React hook that fetches a pool of African/Nigerian governance images from Pixabay.
 * Returns an array of image URLs and a helper to pick one by index.
 *
 * Usage:
 *   const { getImage, images } = usePixabayImages('finance', 6);
 *   <img src={getImage(0)} />
 *
 * @param {string} queryKey - Key from PIXABAY_QUERIES (e.g. 'finance', 'governance')
 * @param {number} count - Number of images to fetch
 * @param {string} fallback - Fallback Unsplash URL if Pixabay fails
 */
export function usePixabayImages(queryKey = 'governance', count = 6, fallback = null) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const stableKey = `${queryKey}_${count}`;
  const fetchedRef = useRef('');

  useEffect(() => {
    if (fetchedRef.current === stableKey) return;
    fetchedRef.current = stableKey;

    const query = PIXABAY_QUERIES[queryKey] || queryKey;

    fetchPixabayImages(query, { per_page: Math.min(count, 20) })
      .then(urls => {
        setImages(urls);
      })
      .catch(() => {
        setImages([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [stableKey]);

  /**
   * Get an image by index, cycling through available images.
   * Falls back to the provided fallback URL if no images are available.
   */
  const getImage = (index = 0) => {
    if (images.length === 0) return fallback;
    return images[index % images.length];
  };

  return { images, getImage, loading };
}

/**
 * usePixabayPortraits
 * Specialized hook for fetching African professional portrait images (for avatars).
 *
 * @param {number} count - Number of portraits to fetch
 */
export function usePixabayPortraits(count = 6) {
  return usePixabayImages('portraits', count, 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=facearea&facepad=3&w=300&h=300&q=80');
}
