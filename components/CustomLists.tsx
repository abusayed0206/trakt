'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaImdb, FaList, FaChevronDown } from 'react-icons/fa';
import { SiTrakt, SiLetterboxd, SiThemoviedatabase } from 'react-icons/si';
import { UserList, ListItem } from '@/lib/types';
import { fetchUserLists, fetchListItems } from '@/lib/services/api';
import { getLetterboxdUrl, getTraktUrl, getImdbUrl, getTmdbUrl, formatDate } from '@/lib/utils/media';
import LazyImage from './LazyImage';

export default function CustomLists() {
  const [lists, setLists] = useState<UserList[]>([]);
  const [selectedList, setSelectedList] = useState<UserList | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);

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
        try {
          const items = await fetchListItems(selectedList.ids.slug);
          setListItems(items.slice(0, 10)); // Show only first 10 items
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
        <div className="flex items-center gap-3 mb-6">
          <FaList className="text-indigo-500 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Custom Lists</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
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
      <div className="flex items-center gap-3 mb-6">
        <FaList className="text-indigo-500 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Custom Lists</h2>
      </div>

      {/* Lists Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {lists.map((list) => (
          <div key={list.ids.trakt} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-lg">{list.name}</h3>
              <Link
                href={list.share_link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-600 transition-colors"
                title="View on Trakt"
              >
                <SiTrakt className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{list.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{list.item_count} items</span>
              <span>Updated {formatDate(list.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* List Dropdown */}
      {lists.length > 0 && (
        <div className="mb-6">
          <label htmlFor="list-select" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
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
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {listItems.map((item) => (
                <div key={item.id} className="group">
                  <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100">
                    <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
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
                  
                  {/* External links below poster */}
                  <div className="flex gap-2 mb-2 justify-center">
                    {item.type === 'movie' && (
                      <Link
                        href={getLetterboxdUrl(item.movie!.ids.imdb)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
                        title="View on Letterboxd"
                      >
                        <SiLetterboxd className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={getTraktUrl(
                        item.type === 'movie' ? item.movie!.ids.trakt : item.show!.ids.trakt, 
                        item.type === 'movie' ? 'movie' : 'show'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                      title="View on Trakt"
                    >
                      <SiTrakt className="w-4 h-4" />
                    </Link>
                    <Link
                      href={getImdbUrl(item.type === 'movie' ? item.movie!.ids.imdb : item.show!.ids.imdb)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
                      title="View on IMDB"
                    >
                      <FaImdb className="w-4 h-4" />
                    </Link>
                    <Link
                      href={getTmdbUrl(
                        item.type === 'movie' ? item.movie!.ids.tmdb : item.show!.ids.tmdb,
                        item.type === 'movie' ? 'movie' : 'tv'
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                      title="View on TMDB"
                    >
                      <SiThemoviedatabase className="w-4 h-4" />
                    </Link>
                  </div>                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                      {item.type === 'movie' ? item.movie!.title : item.show!.title}
                    </h4>
                    <p className="text-gray-500 text-xs mb-1">
                      {item.type === 'movie' ? item.movie!.year : item.show!.year}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Added {formatDate(item.listed_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
