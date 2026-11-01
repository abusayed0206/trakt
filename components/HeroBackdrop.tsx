/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';

/** Picks one backdrop per visit; chosen after mount so the static HTML stays the same for everyone */
export default function HeroBackdrop({ urls }: { urls: string[] }) {
  const [src, setSrc] = useState<string>();

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
      className="absolute inset-0 -z-20 h-full w-full object-cover"
    />
  );
}
