import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Info, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Button } from './ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const Hero = ({ onViewPost }) => {
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    fetchFeaturedPost();
  }, []);

  const fetchFeaturedPost = async () => {
    try {
      const response = await axios.get(`${API}/posts/featured`);
      setFeaturedPost(response.data);
    } catch (error) {
      console.error('Error fetching featured post:', error);
    }
  };

  if (!featuredPost) {
    return (
      <div className="relative h-[85vh] w-full bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
        style={{
          backgroundImage: `url(${featuredPost.media.url})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        {/* Animated overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-purple-900/20 animate-pulse-slow" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-16 lg:px-24 max-w-3xl">
        {/* Platform Badge */}
        <div className="mb-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full w-fit">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: featuredPost.platformColor }}
          />
          <span className="text-white text-sm font-medium uppercase tracking-wider">
            {featuredPost.platform}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
          Viral Now
        </h1>

        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={featuredPost.user.avatar} 
            alt={featuredPost.user.name}
            className="w-12 h-12 rounded-full border-2 border-white/30"
          />
          <div>
            <p className="text-white font-semibold">{featuredPost.user.name}</p>
            <p className="text-gray-300 text-sm">{featuredPost.user.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-white">
            <Heart className="w-5 h-5" fill="white" />
            <span className="font-semibold">{formatNumber(featuredPost.likes)}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{formatNumber(featuredPost.comments)}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Share2 className="w-5 h-5" />
            <span className="font-semibold">{formatNumber(featuredPost.shares)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-white text-lg md:text-xl mb-8 leading-relaxed max-w-2xl">
          {featuredPost.content}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-white/90 font-semibold px-8 transition-all duration-300 hover:scale-110 hover:shadow-2xl transform"
            onClick={() => onViewPost(featuredPost)}
          >
            <Play className="w-5 h-5 mr-2" fill="black" />
            Watch Now
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="bg-gray-500/30 text-white border-white/40 hover:bg-gray-500/50 backdrop-blur-md font-semibold px-8 transition-all duration-300 hover:scale-110 hover:shadow-2xl transform"
            onClick={() => onViewPost(featuredPost)}
          >
            <Info className="w-5 h-5 mr-2" />
            More Info
          </Button>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
};

export default Hero;