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
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);

  if (!post) return null;

  // Check if it's a YouTube video
  const isYouTubeVideo = post.platform === 'youtube' && post.youtube_id;
  const youtubeEmbedUrl = isYouTubeVideo ? `https://www.youtube.com/embed/${post.youtube_id}?autoplay=1&rel=0` : null;
  
  // Check if it's TikTok video
  const isTikTokVideo = post.platform === 'tiktok' && post.tiktok_id;
  const tiktokEmbedUrl = isTikTokVideo ? `https://www.tiktok.com/embed/v2/${post.tiktok_id}` : null;
  
  // Check if it's a Reddit video with actual video URL
  const isRedditVideo = post.platform === 'reddit' && post.media.type === 'video' && post.media.url && !post.media.url.includes('unsplash');
  
  // Check if any video type
  const isAnyVideo = post.media.type === 'video';
  
  // Check if we have actual playable video content
  const hasPlayableVideo = isYouTubeVideo || isTikTokVideo || isRedditVideo || (isAnyVideo && post.media.url && !post.media.url.includes('unsplash'));

  const handlePlayVideo = () => {
    if (!hasPlayableVideo) {
      setVideoError(true);
      return;
    }
    setIsLoading(true);
    setShowPlayButton(false);
    // Simulate loading time
    setTimeout(() => {
      setIsPlaying(true);
      setIsLoading(false);
    }, 800);
  };

  const resetVideoState = () => {
    setIsPlaying(false);
    setShowPlayButton(true);
    setIsLoading(false);
    setVideoError(false);
  };

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
                {!isPlaying && !isLoading && showPlayButton ? (
                  // Thumbnail with play button
                  <div 
                    className="w-full h-full relative cursor-pointer group"
                    onClick={handlePlayVideo}
                  >
                    <img 
                      src={post.media.thumbnail || post.media.url}
                      alt={post.content}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 w-32 h-32 rounded-full bg-red-600 opacity-30 animate-ping"></div>
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl border-4 border-white group-hover:scale-110 transition-transform">
                          <div className="w-0 h-0 border-t-[24px] border-t-transparent border-l-[40px] border-l-white border-b-[24px] border-b-transparent ml-2" />
                        </div>
                      </div>
                      <div className="text-white text-2xl font-bold tracking-wider">PLAY VIDEO</div>
                      <div className="text-gray-300 text-sm mt-2">YouTube</div>
                    </div>
                  </div>
                ) : isLoading ? (
                  // Loading/Buffering state
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <img 
                      src={post.media.thumbnail || post.media.url}
                      alt={post.content}
                      className="w-full h-full object-cover opacity-30 blur-sm"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative w-24 h-24 mb-4">
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-gray-600"></div>
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-red-600 border-r-red-600 border-b-transparent border-l-transparent animate-spin"></div>
                      </div>
                      <div className="text-white text-xl font-bold">Loading video...</div>
                      <div className="text-gray-400 text-sm mt-2">Please wait</div>
                    </div>
                  </div>
                ) : (
                  // YouTube iframe
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
                )}
              </div>
            ) : isTikTokVideo ? (
              // TikTok video player
              <div className="w-full h-full relative">
                {!isPlaying && !isLoading && showPlayButton ? (
                  <div 
                    className="w-full h-full relative cursor-pointer group"
                    onClick={handlePlayVideo}
                  >
                    <img 
                      src={post.media.thumbnail || post.media.url}
                      alt={post.content}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 w-32 h-32 rounded-full bg-red-600 opacity-30 animate-ping"></div>
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl border-4 border-white group-hover:scale-110 transition-transform">
                          <div className="w-0 h-0 border-t-[24px] border-t-transparent border-l-[40px] border-l-white border-b-[24px] border-b-transparent ml-2" />
                        </div>
                      </div>
                      <div className="text-white text-2xl font-bold tracking-wider">PLAY VIDEO</div>
                      <div className="text-gray-300 text-sm mt-2">TikTok</div>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <img 
                      src={post.media.thumbnail || post.media.url}
                      alt={post.content}
                      className="w-full h-full object-contain opacity-30 blur-sm"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative w-24 h-24 mb-4">
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-gray-600"></div>
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-red-600 border-r-red-600 border-b-transparent border-l-transparent animate-spin"></div>
                      </div>
                      <div className="text-white text-xl font-bold">Loading video...</div>
                      <div className="text-gray-400 text-sm mt-2">Please wait</div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={tiktokEmbedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={post.content}
                  />
                )}
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
            ) : isAnyVideo ? (
              // Generic video or demo video placeholder
              <div className="w-full h-full relative">
                {videoError ? (
                  // Error state - video not available
                  <div className="w-full h-full relative flex items-center justify-center">
                    <img 
                      src={post.media.thumbnail || post.media.url}
                      alt={post.content}
                      className="w-full h-full object-contain opacity-50"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                      <div className="bg-red-600/20 border-2 border-red-600 rounded-full p-6 mb-4">
                        <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="text-white text-xl font-bold mb-2">Video Demo Content</div>
                      <div className="text-gray-300 text-sm text-center max-w-md px-4">
                        This is a demonstration post. Connect real {post.platform} API to play actual videos.
                      </div>
                      <button
                        onClick={resetVideoState}
                        className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : !isPlaying && !isLoading && showPlayButton ? (
                  <div 
                    className="w-full h-full relative cursor-pointer group"
                    onClick={handlePlayVideo}
                  >
                    <img 
                      src={post.media.thumbnail || post.media.url}
                      alt={post.content}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                      <div className="relative mb-4">
                        <div className="absolute inset-0 w-32 h-32 rounded-full bg-red-600 opacity-30 animate-ping"></div>
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl border-4 border-white group-hover:scale-110 transition-transform">
                          <div className="w-0 h-0 border-t-[24px] border-t-transparent border-l-[40px] border-l-white border-b-[24px] border-b-transparent ml-2" />
                        </div>
                      </div>
                      <div className="text-white text-2xl font-bold tracking-wider">PLAY VIDEO</div>
                      <div className="text-gray-300 text-sm mt-2 capitalize">{post.platform}</div>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="w-full h-full relative flex items-center justify-center bg-black">
                    <img 
                      src={post.media.thumbnail || post.media.url}
                      alt={post.content}
                      className="w-full h-full object-contain opacity-30 blur-sm"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="relative w-24 h-24 mb-4">
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-gray-600"></div>
                        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-t-red-600 border-r-red-600 border-b-transparent border-l-transparent animate-spin"></div>
                      </div>
                      <div className="text-white text-xl font-bold">Loading video...</div>
                      <div className="text-gray-400 text-sm mt-2">Please wait</div>
                    </div>
                  </div>
                ) : hasPlayableVideo && post.media.url ? (
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
                ) : null}
              </div>
            ) : (
              // Regular image
              <img 
                src={post.media.url}
                alt={post.content}
                loading="lazy"
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-8">
                  <button 
                    className="flex flex-col items-center gap-1 text-white hover:text-red-500 transition-all transform hover:scale-110"
                    onClick={handleLike}
                  >
                    <Heart 
                      className="w-7 h-7" 
                      fill={isLiked ? "currentColor" : "none"}
                    />
                    <span className="font-bold text-sm">{formatNumber(localLikes)}</span>
                  </button>
                  <div className="flex flex-col items-center gap-1 text-white">
                    <MessageCircle className="w-7 h-7" />
                    <span className="font-bold text-sm">{formatNumber(post.comments || 0)}</span>
                  </div>
                  <button 
                    className="flex flex-col items-center gap-1 text-white hover:text-blue-500 transition-all transform hover:scale-110"
                    onClick={handleShare}
                  >
                    <Share2 className="w-7 h-7" />
                    <span className="font-bold text-sm">{formatNumber(post.shares || 0)}</span>
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