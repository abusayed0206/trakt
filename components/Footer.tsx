import Link from 'next/link';
import { FaGithub, FaBook, FaCode } from 'react-icons/fa';
import { Icons } from '@/lib/utils/icons';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Watch Dashboard</h3>
            <p className="text-gray-600 text-sm">
              Your personal Trakt.tv dashboard
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <Link
              href="/docs"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaBook className="w-4 h-4" />
              <span className="text-sm font-medium">Documentation</span>
            </Link>
            
            <Link
              href="/api-test"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaCode className="w-4 h-4" />
              <span className="text-sm font-medium">API Test</span>
            </Link>
            
            <Link
              href="https://github.com/abusayed0206/watch/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaGithub className="w-4 h-4" />
              <span className="text-sm font-medium">GitHub</span>
            </Link>
          </div>
        </div>
        
        {/* Credits Section */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm font-medium">Powered by:</span>
              <Link
                href="https://trakt.tv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Icons.Trakt className="w-5 h-5" />
                <span className="text-sm font-medium">Trakt</span>
              </Link>
              <Link
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Icons.Tmdb className="w-5 h-5" />
                <span className="text-sm font-medium">TMDB</span>
              </Link>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Watch Dashboard. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
