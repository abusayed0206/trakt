import Image from "next/image";
import { FaImdb, FaFilm } from "react-icons/fa";
import { SiTrakt, SiLetterboxd, SiThemoviedatabase } from "react-icons/si";

// Icon component props
interface IconProps {
  className?: string;
  size?: number;
  alt?: string;
}

// Custom logo components using local files
export const LogoIcons = {
  Imdb: ({ className = "w-6 h-6 rounded-lg", alt = "" }: IconProps) => (
    <Image
      src="/logos/imdb.png"
      alt={alt}
      width={24}
      height={24}
      className={className}
    />
  ),

  Letterboxd: ({ className = "w-6 h-6 rounded-lg", alt = "" }: IconProps) => (
    <Image
      src="/logos/lb.svg"
      alt={alt}
      width={24}
      height={24}
      className={className}
    />
  ),

  Tmdb: ({ className = "w-6 h-6 rounded-lg", alt = "" }: IconProps) => (
    <Image
      src="/logos/tmdb.svg"
      alt={alt}
      width={24}
      height={24}
      className={className}
    />
  ),

  Trakt: ({ className = "w-6 h-6 rounded-lg", alt = "" }: IconProps) => (
    <Image
      src="/logos/trakt.svg"
      alt={alt}
      width={24}
      height={24}
      className={className}
    />
  ),

  TraktT: ({ className = "w-6 h-6 rounded-lg", alt = "" }: IconProps) => (
    <Image
      src="/logos/t.svg"
      alt={alt}
      width={24}
      height={24}
      className={className}
    />
  ),
};

// Fallback to react-icons if needed
export const FallbackIcons = {
  Imdb: FaImdb,
  Letterboxd: SiLetterboxd,
  Tmdb: SiThemoviedatabase,
  Trakt: SiTrakt,
  Film: FaFilm,
};

// Combined icon utility
export const Icons = {
  ...LogoIcons,
  Film: FaFilm,
};

// Icon wrapper for consistent styling
interface IconLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  className?: string;
  iconClassName?: string;
  external?: boolean;
}

export const IconLink: React.FC<IconLinkProps> = ({
  href,
  icon: Icon,
  title,
  className = "rounded-lg",
  iconClassName = "w-6 h-6",
  external = true,
}) => {
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a href={href} title={title} className={className} {...linkProps}>
      <Icon className={iconClassName} />
    </a>
  );
};
