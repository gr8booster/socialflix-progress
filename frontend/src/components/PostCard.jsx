import React from 'react';
import { Heart, MessageCircle, Share2, Play } from 'lucide-react';

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const PostCard = ({ post, onClick }) => {
  const [isClicked, setIsClicked] = React.useState(false);
  
  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      onClick(post);
      setIsClicked(false);
    }, 200);
  };

  return (
    <div 
      className={`group relative flex-shrink-0 w-[280px] md:w-[320px] cursor-pointer transition-all duration-500 hover:scale-110 hover:z-50 ${isClicked ? 'scale-95' : ''}`}
      onClick={handleClick}
    >
      {/* Card Container */}
      <div className="relative rounded-lg overflow-hidden bg-gray-900 shadow-2xl group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-500">
        {/* Image/Video Thumbnail */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img 
            src={post.media.type === 'video' ? post.media.thumbnail : post.media.url}
            alt={post.content}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125 group-hover:brightness-110"
          />
          
          {/* Play Button for Videos */}
          {post.media.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm group-hover:scale-125 group-hover:bg-white transition-all duration-300 animate-pulse">
                <Play className="w-8 h-8 text-black ml-1" fill="black" />
              </div>
            </div>
          )}
          
          {/* Platform Badge */}
          <div 
            className="absolute top-3 left-3 px-4 py-2 rounded-full text-white text-xs font-bold uppercase backdrop-blur-md shadow-lg transform group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: post.platformColor }}
          >
            {post.platform}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 group-hover:translate-y-0 transition-transform">
          {/* User Info */}
          <div className="flex items-center gap-2 mb-2">
            <img 
              src={post.user.avatar}
              alt={post.user.name}
              className="w-8 h-8 rounded-full border-2 border-white/50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{post.user.name}</p>
              <p className="text-xs text-gray-300 truncate">{post.user.username}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm mb-2">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" fill="white" />
              <span className="font-medium">{formatNumber(post.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{formatNumber(post.comments)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span className="font-medium">{formatNumber(post.shares)}</span>
            </div>
          </div>

          {/* Content Preview */}
          <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostCard;