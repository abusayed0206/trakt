import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { Icons } from '@/lib/utils/icons';

const linkClass = 'flex items-center gap-1.5 px-1 py-2 hover:text-white';

export default function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-zinc-400">
        <nav className="flex flex-wrap items-center justify-center gap-x-5">
          <Link href="/docs" className={linkClass}>API docs</Link>
          <Link href="/api-test" className={linkClass}>API tester</Link>
          <a href="https://github.com/abusayed0206/trakt" target="_blank" rel="noopener noreferrer" className={linkClass}>
            <FaGithub aria-hidden /> GitHub
          </a>
        </nav>
        <div className="flex flex-wrap items-center justify-center gap-x-4">
          <span>Data from</span>
          <a href="https://trakt.tv" target="_blank" rel="noopener noreferrer" className={linkClass}>
            <Icons.Trakt className="h-4 w-4 rounded" alt="" /> Trakt
          </a>
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className={linkClass}>
            <Icons.Tmdb className="h-4 w-4 rounded" alt="" /> TMDB
          </a>
        </div>
      </div>
    </footer>
  );
}
