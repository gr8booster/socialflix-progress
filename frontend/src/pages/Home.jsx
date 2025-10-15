import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PostCarousel from '../components/PostCarousel';
import PostModal from '../components/PostModal';
import { Toaster } from '../components/ui/toaster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch all posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Show scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`);
      setAllPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
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
      <Navbar />
      
      {/* Hero Section */}
      <Hero onViewPost={handleViewPost} />

      {/* Content Sections */}
      <div className="relative z-10 -mt-32">
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

      {/* Post Modal */}
      <PostModal 
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Toast Notifications */}
      <Toaster />

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