import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const { user, login, logout, loading } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Save to recent searches
      const updatedSearches = [
        searchQuery,
        ...recentSearches.filter(s => s !== searchQuery)
      ].slice(0, 10); // Keep last 10 searches
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      // Navigate to search results
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowRecentSearches(false);
    }
  };

  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    navigate(`/search?q=${encodeURIComponent(search)}`);
    setShowRecentSearches(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowRecentSearches(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          <h1 
            onClick={() => navigate('/')}
            className="text-3xl font-bold text-red-600 tracking-tight cursor-pointer hover:text-red-500 transition-colors"
          >
            ChyllApp
          </h1>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-white hover:text-gray-300 transition-colors font-medium">Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Trending</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Viral</a>
            {user ? (
              <a href="/profile" className="text-gray-300 hover:text-white transition-colors">My Profile</a>
            ) : (
              <a href="#" className="text-gray-300 hover:text-white transition-colors">My Feed</a>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative" ref={searchRef}>
            <Search className={`absolute left-3 w-4 h-4 transition-colors z-10 ${isSearchFocused ? 'text-red-500' : 'text-gray-400'}`} />
            <Input 
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                setShowRecentSearches(true);
              }}
              className="pl-10 bg-black/50 border-gray-700 text-white placeholder:text-gray-500 w-64 focus:w-80 focus:border-red-500 transition-all duration-300"
            />
            
            {/* Recent Searches Dropdown */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                <div className="flex items-center justify-between px-3 py-1 mb-1">
                  <span className="text-xs text-gray-400 uppercase">Recent Searches</span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs text-red-500 hover:text-red-400"
                  >
                    Clear
                  </button>
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-800 text-sm text-white transition-colors"
                  >
                    <Search className="w-3 h-3 inline mr-2 text-gray-500" />
                    {search}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Icons */}
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Search className="w-5 h-5 md:hidden" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Bell className="w-5 h-5" />
          </Button>

          {/* User Authentication */}
          {processingSession ? (
            <div className="text-white text-sm">Loading...</div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-red-500"
                    />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={login} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;