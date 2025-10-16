import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Bell, User, LogOut, Sparkles, Menu, X, TrendingUp, Crown, Code, Zap, Link2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const { user, login, loginWithFacebook, logout, loading, processingSession } = useAuth();
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
            <a href="/chill" className="text-white hover:text-gray-300 transition-colors font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 flex items-center gap-1">
              <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
              CHILL FEED
            </a>
            <a href="/" className="text-gray-300 hover:text-white transition-colors font-medium">Classic</a>
            <a href="/recommendations" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              {t('forYou')}
            </a>
            {user ? (
              <a href="/profile" className="text-gray-300 hover:text-white transition-colors">{t('myProfile')}</a>
            ) : (
              <a href="#" className="text-gray-300 hover:text-white transition-colors">{t('myFeed')}</a>
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
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-gray-300 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300 hidden md:flex">
            <Search className="w-5 h-5" />
          </Button>
          
          {/* Language Selector */}
          <LanguageSelector />
          
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Bell className="w-5 h-5" />
          </Button>

          {/* User Authentication */}
          {processingSession ? (
            <div className="text-white text-sm">{t('loading')}</div>
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
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="relative">
              <Button 
                onClick={() => setShowLoginMenu(!showLoginMenu)} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {t('signIn')}
              </Button>
              
              {showLoginMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => { login(); setShowLoginMenu(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800 text-white transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    onClick={() => { loginWithFacebook(); setShowLoginMenu(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800 text-white transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800 py-4 px-8">
          <div className="flex flex-col gap-4">
            <a 
              href="/chill" 
              className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 font-black text-2xl flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Zap className="w-6 h-6 text-yellow-500" />
              CHILL FEED
            </a>
            <a 
              href="/" 
              className="text-white hover:text-red-500 transition-colors font-medium text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Classic Feed
            </a>
            <a 
              href="/recommendations" 
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="w-5 h-5" />
              {t('forYou')}
            </a>
            <a 
              href="/analytics" 
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <TrendingUp className="w-5 h-5" />
              {t('analytics')}
            </a>
            <a 
              href="/premium" 
              className="text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-2 text-lg font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Crown className="w-5 h-5" />
              Premium
            </a>
            <a 
              href="/creator" 
              className="text-pink-500 hover:text-pink-400 transition-colors flex items-center gap-2 text-lg font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              Creator
            </a>
            <a 
              href="/developer" 
              className="text-purple-500 hover:text-purple-400 transition-colors flex items-center gap-2 text-lg font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Code className="w-5 h-5" />
              Developer
            </a>
            <a 
              href="#" 
              className="text-gray-300 hover:text-white transition-colors text-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('viral')}
            </a>
            {user ? (
              <a 
                href="/profile" 
                className="text-gray-300 hover:text-white transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('myProfile')}
              </a>
            ) : (
              <a 
                href="#" 
                className="text-gray-300 hover:text-white transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('myFeed')}
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;