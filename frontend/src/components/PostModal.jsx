import React, { useState } from 'react';
import axios from 'axios';
import { X, Heart, MessageCircle, Share2, Send } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from '../hooks/use-toast';

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

const PostModal = ({ post, isOpen, onClose }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [localLikes, setLocalLikes] = useState(post?.likes || 0);

  if (!post) return null;

  // Check if it's a YouTube video
  const isYouTubeVideo = post.platform === 'youtube' && post.youtube_id;
  const youtubeEmbedUrl = isYouTubeVideo ? `https://www.youtube.com/embed/${post.youtube_id}?autoplay=1&rel=0` : null;
  
  // Check if it's TikTok video
  const isTikTokVideo = post.platform === 'tiktok' && post.media.type === 'video';
  
  // Check if it's a Reddit video
  const isRedditVideo = post.platform === 'reddit' && post.media.type === 'video';
  
  // Check if any video type
  const isAnyVideo = post.media.type === 'video';

  const handleLike = async () => {
    try {
      const response = await axios.post(`${API}/posts/${post.id}/like`, {
        userId: 'demo-user'
      });
      setIsLiked(!isLiked);
      setLocalLikes(response.data.likes);
      toast({
        title: "Liked!",
        description: "Added to your likes",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: "Failed to like post",
        duration: 2000,
        variant: "destructive"
      });
    }
  };

  const handleComment = async () => {
    if (comment.trim()) {
      try {
        const response = await axios.post(`${API}/posts/${post.id}/comment`, {
          userId: 'demo-user',
          comment: comment
        });
        toast({
          title: "Comment Posted!",
          description: "Your comment has been added",
          duration: 2000,
        });
        setComment('');
      } catch (error) {
        console.error('Error posting comment:', error);
        toast({
          title: "Error",
          description: "Failed to post comment",
          duration: 2000,
          variant: "destructive"
        });
      }
    }
  };

  const handleShare = async () => {
    try {
      const response = await axios.post(`${API}/posts/${post.id}/share`, {
        userId: 'demo-user'
      });
      toast({
        title: "Shared!",
        description: "Post shared successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post",
        duration: 2000,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 bg-black border-gray-800 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side - Media */}
          <div className="flex-1 bg-black flex items-center justify-center relative">
            {isYouTubeVideo ? (
              // YouTube video player
              <div className="w-full h-full relative">
                <iframe
                  width="100%"
                  height="100%"
                  src={youtubeEmbedUrl}
                  title={post.content}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : isRedditVideo && post.media.url ? (
              // Reddit video player
              <video
                controls
                autoPlay
                loop
                className="max-w-full max-h-full"
                poster={post.media.thumbnail}
              >
                <source src={post.media.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : isTikTokVideo || isAnyVideo ? (
              // TikTok and other videos - show thumbnail with prominent play overlay
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={post.media.thumbnail || post.media.url}
                  alt={post.content}
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  {/* Large pulsing play button */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-600 opacity-30 animate-ping"></div>
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl border-4 border-white cursor-pointer hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[32px] border-l-white border-b-[20px] border-b-transparent ml-2" />
                    </div>
                  </div>
                  <div className="text-white text-xl font-bold tracking-wider">TAP TO PLAY</div>
                  <div className="text-gray-300 text-sm mt-2">Video content from {post.platform}</div>
                </div>
              </div>
            ) : (
              // Regular image
              <img 
                src={post.media.url}
                alt={post.content}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>

          {/* Right Side - Details */}
          <div className="w-full md:w-[400px] bg-gray-950 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold">{post.user.name}</p>
                    <p className="text-gray-400 text-sm">{post.user.username}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={onClose}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Platform Badge */}
              <div 
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-bold uppercase"
                style={{ backgroundColor: post.platformColor }}
              >
                {post.platform}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-white text-base leading-relaxed mb-4">
                {post.content}
              </p>
              <p className="text-gray-500 text-sm">{post.timestamp}</p>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-800 p-4">
              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-6">
                  <button 
                    className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
                    onClick={handleLike}
                  >
                    <Heart 
                      className="w-6 h-6" 
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    <span className="font-semibold">{formatNumber(localLikes)}</span>
                  </button>
                  <div className="flex items-center gap-2 text-white">
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-semibold">{formatNumber(post.comments)}</span>
                  </div>
                  <button 
                    className="flex items-center gap-2 text-white hover:text-blue-500 transition-colors"
                    onClick={handleShare}
                  >
                    <Share2 className="w-6 h-6" />
                    <span className="font-semibold">{formatNumber(post.shares)}</span>
                  </button>
                </div>
              </div>

              {/* Comment Input */}
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  className="flex-1 bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
                />
                <Button 
                  size="icon"
                  onClick={handleComment}
                  disabled={!comment.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostModal;