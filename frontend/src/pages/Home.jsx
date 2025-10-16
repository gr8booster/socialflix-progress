import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PostCarousel from '../components/PostCarousel';
import PostModal from '../components/PostModal';
import IframeWarning from '../components/IframeWarning';
import FiltersPanel from '../components/FiltersPanel';
import NewPostsNotification from '../components/NewPostsNotification';
import InstallPWA from '../components/InstallPWA';
import { Toaster } from '../components/ui/toaster';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    platforms: [],
    categories: [],
    timeRange: 'all',
    sortBy: 'date',
  });
  const [lastCheckTime, setLastCheckTime] = useState(new Date().toISOString());

  const POSTS_PER_PAGE = 50;

  // Check for OAuth callback success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const platformConnected = urlParams.get('platform_connected');
    const error = urlParams.get('error');
    
    if (platformConnected) {
      toast({
        title: "Platform Connected!",
        description: `Successfully connected your ${platformConnected} account. You can now view content from ${platformConnected}!`,
        duration: 5000,
      });
      // Clean URL
      window.history.replaceState({}, '', '/');
    } else if (error === 'oauth_failed') {
      toast({
        title: "Connection Failed",
        description: "Failed to connect platform. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Fetch initial posts on component mount with caching
  useEffect(() => {
    fetchInitialPosts();
  }, []);

  // Infinite scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);

      // Check if user scrolled near bottom
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 1000 && !loadingMore && hasMore) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, page]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildFilterParams = (skipValue = 0) => {
    const params = {
      limit: POSTS_PER_PAGE,
      skip: skipValue,
    };

    if (activeFilters.platforms.length > 0) {
      params.platform = activeFilters.platforms.join(',');
    }
    if (activeFilters.categories.length > 0) {
      params.category = activeFilters.categories.join(',');
    }
    if (activeFilters.timeRange && activeFilters.timeRange !== 'all') {
      params.time_range = activeFilters.timeRange;
    }
    if (activeFilters.sortBy) {
      params.sort_by = activeFilters.sortBy;
    }

    return params;
  };

  const fetchInitialPosts = async () => {
    try {
      // Skip cache when filters are active
      const hasActiveFilters = activeFilters.platforms.length > 0 || 
                               activeFilters.categories.length > 0 ||
                               activeFilters.timeRange !== 'all' ||
                               activeFilters.sortBy !== 'date';

      if (!hasActiveFilters) {
        // Check cache first (valid for 5 minutes)
        const cachedData = localStorage.getItem('chyllapp_posts');
        const cacheTime = localStorage.getItem('chyllapp_posts_time');
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

        if (cachedData && cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age < CACHE_DURATION) {
            console.log('Using cached posts data');
            setAllPosts(JSON.parse(cachedData));
            setLoading(false);
            setPage(1);
            return;
          }
        }
      }

      // Fetch from API with filters
      const params = buildFilterParams(0);
      const response = await axios.get(`${API}/posts`, { params });
      setAllPosts(response.data);
      
      // Update cache only if no filters
      if (!hasActiveFilters) {
        localStorage.setItem('chyllapp_posts', JSON.stringify(response.data));
        localStorage.setItem('chyllapp_posts_time', Date.now().toString());
      }
      
      setLoading(false);
      setPage(1);
      setHasMore(response.data.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  // Refetch when filters change
  useEffect(() => {
    setLoading(true);
    setPage(0);
    setAllPosts([]);
    fetchInitialPosts();
  }, [activeFilters]);

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const params = buildFilterParams(page * POSTS_PER_PAGE);
      const response = await axios.get(`${API}/posts`, { params });
      
      if (response.data.length > 0) {
        setAllPosts(prev => [...prev, ...response.data]);
        setPage(prev => prev + 1);
        setHasMore(response.data.length === POSTS_PER_PAGE);
        console.log(`Loaded ${response.data.length} more posts (page ${page + 1})`);
      } else {
        setHasMore(false);
        console.log('No more posts to load');
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const handleSaveFilter = async (filterData) => {
    try {
      await axios.post(`${API}/user/feeds`, filterData, { withCredentials: true });
      toast({
        title: "Filter Saved!",
        description: `"${filterData.name}" has been saved to your feeds`,
      });
    } catch (error) {
      console.error('Error saving filter:', error);
      toast({
        title: "Error",
        description: error.response?.status === 401 ? "Please sign in to save filters" : "Failed to save filter",
        variant: "destructive"
      });
    }
  };

  const handleRefreshPosts = () => {
    setLoading(true);
    setPage(0);
    setAllPosts([]);
    setLastCheckTime(new Date().toISOString());
    fetchInitialPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPostsByPlatform = (platform) => {
    return allPosts.filter(post => post.platform === platform);
  };

  const getPostsByCategory = (category) => {
    return allPosts.filter(post => post.category === category);
  };

  const handleViewPost = (post) => {
    console.log('Opening post:', post);
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPost(null), 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <div className="text-white text-2xl font-bold">Loading ChyllApp...</div>
          <div className="text-gray-400 text-sm mt-2">Fetching viral content from all platforms</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Iframe Warning Banner */}
      <IframeWarning />
      
      {/* New Posts Notification */}
      <NewPostsNotification 
        lastCheckTime={lastCheckTime}
        onRefresh={handleRefreshPosts}
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <Hero onViewPost={handleViewPost} />

      {/* Filters Panel */}
      <div className="relative z-20 -mt-24 px-8 md:px-16 mb-8">
        <FiltersPanel 
          onApplyFilters={handleApplyFilters}
          onSaveFilter={handleSaveFilter}
        />
      </div>

      {/* Content Sections */}
      <div className="relative z-10 -mt-16">
        {/* Trending Now */}
        <PostCarousel 
          title="Trending Now"
          posts={getPostsByCategory('trending')}
          onPostClick={handleViewPost}
        />

        {/* Viral Posts */}
        <PostCarousel 
          title="Viral Posts"
          posts={getPostsByCategory('viral')}
          onPostClick={handleViewPost}
        />

        {/* Instagram */}
        <PostCarousel 
          title="Instagram"
          posts={getPostsByPlatform('instagram')}
          onPostClick={handleViewPost}
        />

        {/* TikTok */}
        <PostCarousel 
          title="TikTok"
          posts={getPostsByPlatform('tiktok')}
          onPostClick={handleViewPost}
        />

        {/* YouTube */}
        <PostCarousel 
          title="YouTube"
          posts={getPostsByPlatform('youtube')}
          onPostClick={handleViewPost}
        />

        {/* Twitter/X */}
        <PostCarousel 
          title="Twitter/X"
          posts={getPostsByPlatform('twitter')}
          onPostClick={handleViewPost}
        />

        {/* Facebook */}
        <PostCarousel 
          title="Facebook"
          posts={getPostsByPlatform('facebook')}
          onPostClick={handleViewPost}
        />

        {/* LinkedIn */}
        <PostCarousel 
          title="LinkedIn"
          posts={getPostsByPlatform('linkedin')}
          onPostClick={handleViewPost}
        />

        {/* Most Liked */}
        <PostCarousel 
          title="Most Liked"
          posts={getPostsByCategory('most-liked')}
          onPostClick={handleViewPost}
        />
      </div>

      {/* Footer */}
      <footer className="mt-16 py-12 px-8 md:px-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-3">Platforms</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter/X</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">TikTok</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">More</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">YouTube</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Preferences</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm">
            <p>© 2025 ChyllApp. All rights reserved.</p>
            <p className="mt-2">Experience the best viral content from all social media platforms in one place.</p>
          </div>
        </div>
      </footer>

      {/* Infinite Scroll Loading Indicator */}
      {loadingMore && (
        <div className="py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600 mb-3"></div>
            <div className="text-white text-lg font-semibold">Loading more posts...</div>
            <div className="text-gray-400 text-sm mt-1">Finding viral content</div>
          </div>
        </div>
      )}

      {/* End of Content Indicator */}
      {!hasMore && allPosts.length > 0 && (
        <div className="py-12 text-center">
          <div className="text-gray-500 text-lg font-semibold mb-2">🎉 You've reached the end!</div>
          <div className="text-gray-600 text-sm">You've seen all {allPosts.length} viral posts</div>
          <button
            onClick={scrollToTop}
            className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Back to Top
          </button>
        </div>
      )}

      {/* Post Modal */}
      <PostModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Toast Notifications */}
      <Toaster />
      
      {/* PWA Install Prompt */}
      <InstallPWA />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 animate-bounce"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Home;