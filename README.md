# Trakt Watch Dashboard

A modern, high-performance Next.js application that provides a beautiful dashboard for your Trakt.tv watch history, watchlists, and personal statistics. Features optimized image loading with lazy loading and a responsive design.

## ✨ Features

- **📊 Comprehensive Dashboard**: View your movie/show history, watchlists, and detailed statistics
- **🖼️ Optimized Images**: Smart lazy loading with wsrv.nl optimization
- **🔍 Advanced Search**: Search through your watched content with real-time filtering
- **📱 Responsive Design**: Perfect experience on desktop, tablet, and mobile
- **⚡ High Performance**: Pre-loaded image index and optimized API responses
- **🎯 External Links**: Quick access to Letterboxd, IMDb, TMDB, and Trakt pages
- **📈 Statistics**: Detailed viewing statistics and trends

## 🚀 Technology Stack

- **Frontend**: Next.js 15.4.1 with App Router
- **Styling**: Tailwind CSS with custom components
- **Images**: Custom lazy loading with wsrv.nl optimization
- **API**: RESTful endpoints serving pre-processed JSON data
- **Data Source**: Trakt.tv API with daily data synchronization
- **Hosting**: Optimized for Cloudflare Pages deployment

## 📁 Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── trakt/             # Trakt data endpoints
│   │   └── images/            # Optimized image serving
│   ├── components/            # React components
│   └── globals.css           # Global styles
├── lib/
│   ├── services/             # Data services and API logic
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── public/
│   └── data/                # Pre-processed JSON data
└── scripts/                 # Data fetching and processing scripts
```

## 🛠️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abusayed0206/watch
   cd watch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Trakt.tv API credentials and configuration.

4. **Fetch initial data**
   ```bash
   cd scripts
   python fetch_trakt_data.py
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📊 Data Management

The application uses pre-processed JSON files for optimal performance:

- **Daily Updates**: Data is synchronized once daily from Trakt.tv
- **Smart Caching**: Image index pre-loaded at startup with 24-hour auto-refresh
- **Optimized Storage**: Efficient data structures for fast lookups

### Data Files Structure

```
public/data/
├── media_index.json          # Image lookup index
└── json/
    ├── index.json           # Main data structure
    └── user/
        ├── profile/         # User profile data
        ├── history/         # Watch history
        ├── watchlist/       # Watchlists
        ├── watched/         # Watched content
        ├── stats/          # Statistics
        ├── lists/          # Custom lists
        └── comments/       # User comments
```

## 🖼️ Image Optimization

Advanced image loading system for optimal performance:

- **Lazy Loading**: Full images load when entering viewport
- **CDN Integration**: wsrv.nl for WebP conversion and optimization
- **Smart Caching**: 7-day browser cache with quality optimization

## 🔧 API Endpoints

The application provides a comprehensive REST API:

### Trakt Data API
- `GET /api/trakt` - Main index and overview
- `GET /api/trakt/user/profile` - User profile information
- `GET /api/trakt/user/history` - Watch history
- `GET /api/trakt/user/watchlist` - Watchlist items
- `GET /api/trakt/search?q=query` - Search functionality

### Image API
- `GET /api/images?type=movies&category=posters&tmdb_id=123` - Full images

## 📱 Components

- **LazyImage**: Advanced image component with lazy loading
- **MovieHistory/ShowHistory**: Recent viewing activity
- **MovieWatchlist**: Prioritized watchlist with rankings
- **SearchInterface**: Real-time content search
- **UserProfileStats**: Comprehensive viewing statistics
- **CustomLists**: Personal curated lists

## 🚀 Deployment

Optimized for Cloudflare Pages:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages**
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `.next`

## 🔐 Environment Variables

```bash
# Trakt.tv API Configuration
TRAKT_CLIENT_ID=your_client_id
TMDB_API_KEY=your_client_secret


# Image CDN Configuration  
CDN_BASE_URL=https://your-cdn.com
WSRV_BASE_URL=https://wsrv.nl



## 📈 Performance Features

- **Pre-loaded Data**: Image index loaded at server startup
- **Optimized Images**: WebP format with quality optimization
- **Smart Caching**: Multiple cache layers for optimal performance
- **Lazy Loading**: Content loads as needed with intersection observer
- **Responsive Design**: Optimized for all device sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Trakt.tv](https://trakt.tv) for the comprehensive API
- [wsrv.nl](https://wsrv.nl) for image optimization services
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
