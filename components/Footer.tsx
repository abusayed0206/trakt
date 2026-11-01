import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import { Icons } from '@/lib/utils/icons';

export default function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-zinc-400 sm:flex-row">
        <div className="flex items-center gap-4">
          <span>Data from</span>
          <a href="https://trakt.tv" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition hover:text-white">
            <Icons.Trakt className="h-4 w-4 rounded" alt="" /> Trakt
          </a>
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition hover:text-white">
            <Icons.Tmdb className="h-4 w-4 rounded" alt="" /> TMDB
          </a>
        </div>
        <nav className="flex items-center gap-5">
          <Link href="/docs" className="transition hover:text-white">API docs</Link>
          <Link href="/api-test" className="transition hover:text-white">API tester</Link>
          <a href="https://github.com/abusayed0206/trakt" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 transition hover:text-white">
            <FaGithub aria-hidden /> GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
