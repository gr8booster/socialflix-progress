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

  // Fetch all posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

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
        <div className="text-white text-2xl">Loading...</div>
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
            <p>© 2025 SocialFlix. All rights reserved.</p>
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
    </div>
  );
};

export default Home;