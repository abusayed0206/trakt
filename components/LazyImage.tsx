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
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Generate API URLs
  const thumbnailUrl = `/api/images?category=${category}&tmdb_id=${tmdbId}`;
  const fullImageUrl = type 
    ? `/api/images?type=${type}&category=${category}&tmdb_id=${tmdbId}${season ? `&season=${season}` : ''}`
    : thumbnailUrl;

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

  // Preload thumbnail immediately
  useEffect(() => {
    const img = new Image();
    img.onload = () => setThumbnailLoaded(true);
    img.src = thumbnailUrl;
  }, [thumbnailUrl]);

  const handleLoad = () => {
    setIsLoaded(true);
    // Trigger the reveal animation after a short delay
    setTimeout(() => {
      setShowFullImage(true);
    }, 100);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Thumbnail - loads immediately with subtle fade */}
      <img
        src={thumbnailUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          thumbnailLoaded && !showFullImage 
            ? 'opacity-100 scale-100 blur-0' 
            : 'opacity-0 scale-105 blur-sm'
        }`}
        loading="eager"
        decoding="async"
      />
      
      {/* Full image - loads when in view with top-to-bottom reveal */}
      {isInView && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={hasError && fallbackSrc ? fallbackSrc : fullImageUrl}
            alt={alt}
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${
              showFullImage 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-110 translate-y-2'
            }`}
            style={{
              clipPath: showFullImage 
                ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' 
                : 'polygon(0 0, 100% 0, 100% 0, 0 0)',
              transition: 'clip-path 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 600ms ease-out, transform 700ms ease-out'
            }}
            loading="lazy"
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
          />
          
          {/* Subtle overlay gradient for depth */}
          <div 
            className={`absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 transition-opacity duration-1000 ${
              showFullImage ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      )}
      
      {/* Loading shimmer effect */}
      {!thumbnailLoaded && !isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
               style={{
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 1.5s infinite'
               }} />
        </div>
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center backdrop-blur-sm">
          <div className="text-gray-400 text-center transform transition-all duration-500 hover:scale-105">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-60" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-xs opacity-80">Image not available</p>
          </div>
        </div>
      )}
      
      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
