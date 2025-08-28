import { useEffect, useState } from 'react';

interface BackdropData {
  url: string;
  tmdbId: string;
  type: 'movies' | 'shows';
  filename: string;
}

export function useRandomBackdrop(watchingBackdrop?: string) {
  const [backdropUrl, setBackdropUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If there's a watching backdrop, use that first
    if (watchingBackdrop) {
      setBackdropUrl(watchingBackdrop);
      setLoading(false);
      return;
    }

    // Otherwise fetch a random backdrop
    const fetchRandomBackdrop = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/images/random-backdrop');
        
        if (!response.ok) {
          throw new Error('Failed to fetch backdrop');
        }
        
        const data: BackdropData = await response.json();
        setBackdropUrl(data.url);
        setError(null);
      } catch (err) {
        console.error('Error fetching random backdrop:', err);
        setError(err instanceof Error ? err.message : 'Failed to load backdrop');
        // Fallback to a gradient background
        setBackdropUrl('');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomBackdrop();
  }, [watchingBackdrop]);

  return { backdropUrl, loading, error };
}
