import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Heart, MessageCircle, Share2, Bookmark, Play } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const ChyllFeed = () => {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-advance every 5 seconds (like hero)
  useEffect(() => {
    if (posts.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % posts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [posts]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/posts?category=viral&sort_by=engagement&limit=50`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
      <Navbar />
      
      <div className="relative h-screen w-full pt-16">
        {/* Auto-sliding posts (like hero) */}
        {posts.map((post, index) => (
          <div 
            key={post.id}
            className={`absolute inset-0 pt-16 transition-all duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 translate-x-0' 
                : index < currentIndex
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Full screen image */}
            <img
              src={post.media.type === 'video' ? post.media.thumbnail : post.media.url}
              alt={post.content}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>
            
            {/* Platform Logo Badge - Top Left */}
            <div className="absolute top-20 left-4 z-10">
              <div 
                className="px-4 py-2 rounded-full font-bold uppercase text-sm backdrop-blur-md border-2"
                style={{ 
                  backgroundColor: `${post.platformColor}DD`,
                  borderColor: 'white',
                  color: 'white'
                }}
              >
                {post.platform}
              </div>
            </div>

            {/* Video Play Icon */}
            {post.media.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center">
                  <Play className="w-10 h-10 text-black ml-1" fill="black" />
                </div>
              </div>
            )}
            
            {/* TikTok-style right side buttons */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-10">
              <div className="flex flex-col items-center text-white">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Heart className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold mt-1">{formatNumber(post.likes)}</span>
              </div>
              <div className="flex flex-col items-center text-white">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold mt-1">{formatNumber(post.comments)}</span>
              </div>
              <div className="flex flex-col items-center text-white">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Share2 className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold mt-1">{formatNumber(post.shares)}</span>
              </div>
              <div className="flex flex-col items-center text-white">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bookmark className="w-7 h-7" />
                </div>
              </div>
            </div>
            
            {/* Instagram-style bottom info */}
            <div className="absolute bottom-8 left-4 right-24 z-10">
              <div className="flex items-center gap-3 mb-3">
                <img src={post.user.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white" />
                <div>
                  <p className="text-white font-bold drop-shadow-lg">{post.user.name}</p>
                  <p className="text-white/80 text-sm drop-shadow-lg">{post.user.username}</p>
                </div>
              </div>
              <p className="text-white text-sm drop-shadow-lg line-clamp-2">{post.content}</p>
            </div>
          </div>
        ))}
        
        {/* Progress dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {posts.slice(0, 10).map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChyllFeed;


