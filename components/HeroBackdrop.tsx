/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';

/** Picks one backdrop per visit; chosen after mount so the static HTML stays the same for everyone */
export default function HeroBackdrop({ urls }: { urls: string[] }) {
  const [src, setSrc] = useState<string>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (urls.length > 0) setSrc(urls[Math.floor(Math.random() * urls.length)]);
  }, [urls]);

  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      fetchPriority="high"
      onLoad={() => setLoaded(true)}
      className={`absolute inset-0 -z-20 h-full w-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
