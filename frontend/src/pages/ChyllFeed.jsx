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
      
      <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide pt-16">
        {posts.map((post) => (
          <div key={post.id} className="h-screen w-full snap-start snap-always relative">
            <img
              src={post.media.type === 'video' ? post.media.thumbnail : post.media.url}
              alt={post.content}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>
            
            <div className="absolute right-4 bottom-24 flex flex-col gap-6">
              <button className="flex flex-col items-center text-white">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Heart className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold mt-1">{formatNumber(post.likes)}</span>
              </button>
              <button className="flex flex-col items-center text-white">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold mt-1">{formatNumber(post.comments)}</span>
              </button>
              <button className="flex flex-col items-center text-white">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bookmark className="w-7 h-7" />
                </div>
              </button>
            </div>
            
            <div className="absolute bottom-8 left-4 right-24">
              <div className="flex items-center gap-3 mb-3">
                <img src={post.user.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white" />
                <div>
                  <p className="text-white font-bold">{post.user.name}</p>
                  <p className="text-white/80 text-sm">{post.user.username}</p>
                </div>
              </div>
              <p className="text-white text-sm line-clamp-2">{post.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChyllFeed;
