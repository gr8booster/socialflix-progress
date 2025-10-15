import React, { useState, useEffect } from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95 backdrop-blur-md' : 'bg-gradient-to-b from-black to-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-8 md:px-16 py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <h1 className="text-3xl font-bold text-red-600 tracking-tight">
            ChyllApp
          </h1>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors font-medium">Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Trending</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Viral</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">My Feed</a>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search posts..."
              className="pl-10 bg-black/50 border-gray-700 text-white placeholder:text-gray-500 w-64 focus:w-80 transition-all"
            />
          </div>

          {/* Icons */}
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Search className="w-5 h-5 md:hidden" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;