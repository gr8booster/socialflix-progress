import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PostModal from '../components/PostModal';
import { Zap, Sparkles, Flame } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const ChyllFeed = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Get most engaging viral content
      const response = await axios.get(`${BACKEND_URL}/api/posts?category=viral&sort_by=engagement&limit=30`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading the Chill...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Navbar />

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-purple-900/20 to-blue-900/20 animate-gradient"></div>
        {/* Matrix rain effect */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 4px)',
          animation: 'matrix 20s linear infinite'
        }}></div>
      </div>

      <div className="relative z-10 pt-24 px-4 md:px-8 pb-16">
        {/* Wild Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-red-600/30 via-purple-600/30 to-blue-600/30 animate-pulse"></div>
          <h1 className="relative text-6xl md:text-8xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-gradient-x" style={{backgroundSize: '200% 200%'}}>
            CHILL FEED
          </h1>
          <p className="relative text-xl text-gray-300 font-light tracking-widest">
            THE MOST VIRAL CONTENT IN THE MULTIVERSE
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Flame className="w-6 h-6 text-red-500 animate-bounce" />
            <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
            <Sparkles className="w-6 h-6 text-blue-500 animate-spin-slow" />
          </div>
        </div>

        {/* Bento Grid Layout - Wild & Unique */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[200px] max-w-7xl mx-auto">
          {posts.map((post, index) => {
            // Create unique grid patterns - MOBILE RESPONSIVE
            const mobilePatterns = [
              'col-span-2 row-span-2', // Large square on mobile
              'col-span-1 row-span-2', // Tall
              'col-span-2 row-span-1', // Wide
              'col-span-1 row-span-1', // Normal
            ];
            
            const desktopPatterns = [
              'md:col-span-3 md:row-span-2', // Large on desktop
              'md:col-span-2 md:row-span-3', // Tall
              'md:col-span-4 md:row-span-2', // Extra wide
              'md:col-span-2 md:row-span-2', // Square
              'md:col-span-2 md:row-span-1', // Normal
            ];
            
            const mobilePattern = mobilePatterns[index % mobilePatterns.length];
            const desktopPattern = desktopPatterns[index % desktopPatterns.length];
            const pattern = `${mobilePattern} ${desktopPattern}`;

            return (
              <div
                key={post.id}
                className={`${pattern} group relative cursor-pointer overflow-hidden rounded-2xl transform transition-all duration-500 hover:scale-105 hover:z-50`}
                onClick={() => setSelectedPost(post)}
                style={{
                  background: `linear-gradient(135deg, ${post.platformColor}40, ${post.platformColor}10)`,
                  border: `2px solid ${post.platformColor}60`,
                  boxShadow: `0 0 30px ${post.platformColor}30`
                }}
              >
                {/* Holographic border effect */}
                <div className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    borderImage: `linear-gradient(45deg, ${post.platformColor}, transparent, ${post.platformColor}) 1`,
                    animation: 'rotateBorder 3s linear infinite'
                  }}
                ></div>

                {/* Content */}
                <div className="relative h-full overflow-hidden">
                  {/* Background Image with Magic Newspaper Effect - ANIMATED */}
                  <div className="absolute inset-0 animate-subtle-move">
                    <img
                      src={post.media.type === 'video' ? post.media.thumbnail : post.media.url}
                      alt={post.content}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      style={{ filter: 'brightness(0.8) contrast(1.2) grayscale(0.2)' }}
                    />
                  </div>
                  
                  {/* Magical shimmer overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                  
                  {/* Vintage newspaper texture */}
                  <div className="absolute inset-0 opacity-30 mix-blend-multiply pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 2px, rgba(255,255,255,0.03) 3px)',
                    backgroundSize: '100% 4px'
                  }}></div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                  {/* Glowing Platform Badge - Magical Style */}
                  <div className="absolute top-4 left-4">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-black uppercase backdrop-blur-md border-2 animate-pulse-glow shadow-2xl"
                      style={{
                        backgroundColor: `${post.platformColor}80`,
                        borderColor: post.platformColor,
                        boxShadow: `0 0 20px ${post.platformColor}, 0 0 40px ${post.platformColor}60`
                      }}
                    >
                      {post.platform}
                    </div>
                  </div>

                  {/* Video Play Icon with Neon Effect */}
                  {post.media.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-red-600 animate-ping"></div>
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center border-4 border-white shadow-2xl">
                          <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Content Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-sm md:text-base line-clamp-2 mb-2 drop-shadow-lg">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-white/90 flex items-center gap-1">
                        ❤️ {formatNumber(post.likes)}
                      </span>
                      <span className="text-white/90 flex items-center gap-1">
                        💬 {formatNumber(post.comments)}
                      </span>
                      {post.media.type === 'video' && (
                        <span className="text-yellow-400 font-bold animate-pulse">
                          ▶ VIDEO
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Scan line effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent h-32 animate-scan"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Action Text */}
        <div className="text-center mt-12 animate-bounce-slow">
          <p className="text-gray-400 text-sm tracking-widest">
            SCROLL TO EXPLORE MORE DIMENSIONS
          </p>
        </div>
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

export default ChyllFeed;
