#!/usr/bin/env python3
"""
Test script to verify Trakt public API access
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv('../.env.local')  # Look in project root folder

def test_trakt_public_api():
    """Test basic Trakt public API access"""
    api_key = os.getenv('TRAKT_API_KEY')
    
    if not api_key:
        print("❌ TRAKT_API_KEY not found in environment")
        return False
    
    print(f"✅ Found API key: {api_key[:8]}...")
    
    headers = {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': api_key
    }
    
    # Test public endpoints
    test_endpoints = [
        ('/movies/trending', 'Trending Movies'),
        ('/shows/trending', 'Trending Shows'),
        ('/movies/popular', 'Popular Movies'),
        ('/shows/popular', 'Popular Shows'),
        ('/genres/movies', 'Movie Genres'),
        ('/movies/boxoffice', 'Box Office')
    ]
    
    print("\n🔍 Testing public API endpoints:")
    
    for endpoint, description in test_endpoints:
        try:
            url = f"https://api.trakt.tv{endpoint}"
            response = requests.get(url, headers=headers, params={'limit': 5})
            
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else 1
                print(f"✅ {description}: {count} items")
            else:
                print(f"❌ {description}: HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
    
    return True

def test_tmdb_api():
    """Test TMDB API access"""
    api_key = os.getenv('TMDB_API_KEY')
    
    if not api_key:
        print("\n❌ TMDB_API_KEY not found in environment")
        return False
    
    print(f"\n✅ Found TMDB API key: {api_key[:8]}...")
    
    try:
        url = "https://api.themoviedb.org/3/configuration"
        response = requests.get(url, params={'api_key': api_key})
        
        if response.status_code == 200:
            print("✅ TMDB API: Connection successful")
            return True
        else:
            print(f"❌ TMDB API: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ TMDB API: Error - {e}")
        return False

if __name__ == '__main__':
    print("🧪 Testing API Access\n")
    
    trakt_ok = test_trakt_public_api()
    tmdb_ok = test_tmdb_api()
    
    print(f"\n📊 Summary:")
    print(f"Trakt API: {'✅ Ready' if trakt_ok else '❌ Failed'}")
    print(f"TMDB API: {'✅ Ready' if tmdb_ok else '❌ Failed'}")
    
    if trakt_ok and tmdb_ok:
        print("\n🎉 All APIs are ready! You can run the data fetch scripts.")
    else:
        print("\n⚠️  Please check your API keys in .env.local")
