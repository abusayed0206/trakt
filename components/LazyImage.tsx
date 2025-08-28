/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  tmdbId: string;
  type?: 'movies' | 'shows';
  category?: 'posters' | 'backdrops';
  season?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export default function LazyImage({
  tmdbId,
  type,
  category = 'posters',
  season,
  alt,
  className = '',
  fallbackSrc
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Generate API URL
  const imageUrl = type 
    ? `/api/images?type=${type}&category=${category}&tmdb_id=${tmdbId}${season ? `&season=${season}` : ''}`
    : `/api/images?type=movies&category=${category}&tmdb_id=${tmdbId}`;

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Image with lazy loading - positioned behind placeholder */}
      {isInView && (
        <img
          src={hasError && fallbackSrc ? fallbackSrc : imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Soft white placeholder - slides down to reveal image */}
      <div 
        className={`absolute inset-0 bg-gray-100 transition-transform duration-700 ease-out ${
          isLoaded ? 'translate-y-full' : 'translate-y-0'
        }`}
      />

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      )}
    </div>
  );
}
