import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import { Button } from '../components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const platformFilter = searchParams.get('platform') || '';
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedPlatform, setSelectedPlatform] = useState(platformFilter);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const platforms = [
    { id: 'all', name: 'All Platforms' },
    { id: 'reddit', name: 'Reddit' },
    { id: 'youtube', name: 'YouTube' },
    { id: 'twitter', name: 'Twitter' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'facebook', name: 'Facebook' },
    { id: 'threads', name: 'Threads' },
    { id: 'snapchat', name: 'Snapchat' },
    { id: 'pinterest', name: 'Pinterest' },
    { id: 'linkedin', name: 'LinkedIn' },
  ];

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, selectedPlatform, sortBy]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = {
        q: query,
        sort_by: sortBy,
      };
      
      if (selectedPlatform && selectedPlatform !== 'all') {
        params.platform = selectedPlatform;
      }

      const response = await axios.get(`${BACKEND_URL}/api/search`, { params });
      setPosts(response.data);
    } catch (error) {
      console.error('Error searching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (post) => {
    setSelectedPost(post);
  };

  const handlePlatformFilter = (platform) => {
    setSelectedPlatform(platform);
    navigate(`/search?q=${encodeURIComponent(query)}${platform !== 'all' ? `&platform=${platform}` : ''}`);
  };

  const clearSearch = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      
      <div className="pt-24 px-8 md:px-16 pb-16">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              Search Results for "{query}"
            </h1>
            <Button
              variant="ghost"
              onClick={clearSearch}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5 mr-2" />
              Clear Search
            </Button>
          </div>
          
          <p className="text-gray-400">
            {loading ? 'Searching...' : `Found ${posts.length} result${posts.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Platform Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">FILTER BY PLATFORM</h3>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Button
                  key={platform.id}
                  onClick={() => handlePlatformFilter(platform.id)}
                  variant={selectedPlatform === platform.id || (selectedPlatform === '' && platform.id === 'all') ? 'default' : 'outline'}
                  className={`${
                    selectedPlatform === platform.id || (selectedPlatform === '' && platform.id === 'all')
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                  }`}
                >
                  {platform.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">SORT BY</h3>
            <div className="flex flex-wrap gap-2">
              {['relevance', 'date', 'likes', 'comments'].map((sort) => (
                <Button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  variant={sortBy === sort ? 'default' : 'outline'}
                  className={`${
                    sortBy === sort
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                  } capitalize`}
                >
                  {sort}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => handleCardClick(post)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No results found</h2>
            <p className="text-gray-500 mb-6">
              Try searching with different keywords or adjust your filters
            </p>
            <Button onClick={clearSearch} className="bg-red-600 hover:bg-red-700">
              Back to Home
            </Button>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default SearchResults;
