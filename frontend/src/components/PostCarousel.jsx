import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from './PostCard';
import { Button } from './ui/button';

const PostCarousel = ({ title, posts, onPostClick }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group mb-12">
      {/* Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 px-8 md:px-16">
        {title}
      </h2>

      {/* Scroll Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Posts Container */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-8 md:px-16 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {posts.map((post, index) => (
          <div 
            key={post.id}
            className="animate-in fade-in slide-in-from-right"
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'backwards' }}
          >
            <PostCard post={post} onClick={onPostClick} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCarousel;