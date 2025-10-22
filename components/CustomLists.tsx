'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaList, FaChevronDown } from 'react-icons/fa';
import { UserList, ListItem } from '@/lib/types';
import { fetchUserLists, fetchListItems } from '@/lib/services/api';
import { getLetterboxdUrl, getTraktUrl, getImdbUrl, getTmdbUrl, formatDate } from '@/lib/utils/media';
import { Icons } from '@/lib/utils/icons';
import LazyImage from './LazyImage';

export default function CustomLists() {
  const [lists, setLists] = useState<UserList[]>([]);
  const [selectedList, setSelectedList] = useState<UserList | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserLists();
        setLists(data);
        if (data.length > 0) {
          setSelectedList(data[0]);
        }
      } catch (error) {
        console.error('Error fetching user lists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedList) {
      const fetchItems = async () => {
        setItemsLoading(true);
        setDisplayCount(10); // Reset display count when switching lists
        try {
          const items = await fetchListItems(selectedList.ids.slug);
          setListItems(items); // Load all items, not just 10
        } catch (error) {
          console.error('Error fetching list items:', error);
        } finally {
          setItemsLoading(false);
        }
      };

      fetchItems();
    }
  }, [selectedList]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaList className="text-gray-800 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Custom Lists</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse border border-gray-100">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-6">
        <FaList className="text-gray-800 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Custom Lists</h2>
      </div>

      {/* Lists Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {lists.map((list) => (
          <div key={list.ids.trakt} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-100 hover:shadow-md">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-lg">{list.name}</h3>
              <Link
                href={list.share_link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-800 transition-colors bg-gray-100 p-2 rounded-lg hover:bg-gray-200"
                title="View on Trakt"
              >
                <Icons.Trakt className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{list.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">{list.item_count} items</span>
              <span>Updated {formatDate(list.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* List Dropdown */}
      {lists.length > 0 && (
        <div className="mb-6 max-w-md mx-auto">
          <label htmlFor="list-select" className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Select a list to view items:
          </label>
          <div className="relative">
            <select
              id="list-select"
              value={selectedList?.ids.slug || ''}
              onChange={(e) => {
                const list = lists.find(l => l.ids.slug === e.target.value);
                setSelectedList(list || null);
              }}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 appearance-none text-center"
            >
              {lists.map((list) => (
                <option key={list.ids.slug} value={list.ids.slug}>
                  {list.name} ({list.item_count} items)
                </option>
              ))}
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* List Items */}
      {selectedList && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedList.name} Items
          </h3>
          
          {itemsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {listItems.slice(0, displayCount).map((item) => (
                  <div key={item.id} className="group">
                    <Link href={item.type === 'movie' ? `/movie/${item.movie!.ids.tmdb}` : `/tv/${item.show!.ids.tmdb}`}>
                      <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100 cursor-pointer">
                        <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          #{item.rank}
                        </div>
                        <LazyImage
                          tmdbId={(item.type === 'movie' ? item.movie!.ids.tmdb : item.show!.ids.tmdb).toString()}
                          type={item.type === 'movie' ? 'movies' : 'shows'}
                          category="posters"
                          alt={item.type === 'movie' ? item.movie!.title : item.show!.title}
                          className="w-full h-full"
                        />
                      </div>
                    </Link>
                    
                    {/* External links below poster */}
                    <div className="flex gap-4 mb-2 justify-center">
                      {item.type === 'movie' && (
                        <Link
                          href={getLetterboxdUrl(item.movie!.ids.imdb)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg"
                          title="View on Letterboxd"
                        >
                          <Icons.Letterboxd className="w-6 h-6" />
                        </Link>
                      )}
                      <Link
                        href={getTraktUrl(
                          item.type === 'movie' ? item.movie!.ids.trakt : item.show!.ids.trakt, 
                          item.type === 'movie' ? 'movie' : 'show'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg"
                        title="View on Trakt"
                      >
                        <Icons.Trakt className="w-6 h-6" />
                      </Link>
                      <Link
                        href={getImdbUrl(item.type === 'movie' ? item.movie!.ids.imdb : item.show!.ids.imdb)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg"
                        title="View on IMDB"
                      >
                        <Icons.Imdb className="w-6 h-6" />
                      </Link>
                      <Link
                        href={getTmdbUrl(
                          item.type === 'movie' ? item.movie!.ids.tmdb : item.show!.ids.tmdb,
                          item.type === 'movie' ? 'movie' : 'tv'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg"
                        title="View on TMDB"
                      >
                        <Icons.Tmdb className="w-6 h-6" />
                      </Link>
                    </div>
                    
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                        {item.type === 'movie' ? item.movie!.title : item.show!.title} ({item.type === 'movie' ? item.movie!.year : item.show!.year})
                      </h4>
                      <p className="text-gray-500 text-xs">
                        Added {formatDate(item.listed_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More and Collapse Buttons */}
              <div className="flex justify-center items-center gap-4 mt-8">
                {listItems.length > displayCount && (
                  <button
                    onClick={() => setDisplayCount(prev => prev + 10)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    Load More ({listItems.length - displayCount} remaining)
                  </button>
                )}
                
                {/* Collapse Button - Show when more than 10 items are displayed */}
                {displayCount > 10 && (
                  <button
                    onClick={() => setDisplayCount(prev => prev - 10)}
                    className="bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    Collapse
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
