import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const NewPostsNotification = ({ lastCheckTime, onRefresh }) => {
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Poll for new posts every 30 seconds
    const checkForNewPosts = async () => {
      if (!lastCheckTime) return;

      try {
        const response = await axios.get(`${BACKEND_URL}/api/posts/new-count`, {
          params: { since: lastCheckTime }
        });

        if (response.data.has_new) {
          setNewPostsCount(response.data.new_count);
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Error checking for new posts:', error);
      }
    };

    // Initial check
    checkForNewPosts();

    // Set up polling interval (30 seconds)
    const interval = setInterval(checkForNewPosts, 30000);

    return () => clearInterval(interval);
  }, [lastCheckTime]);

  const handleRefresh = () => {
    setShowNotification(false);
    setNewPostsCount(0);
    onRefresh();
  };

  if (!showNotification || newPostsCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">
            {newPostsCount} new post{newPostsCount !== 1 ? 's' : ''} available
          </span>
        </div>
        <Button
          onClick={handleRefresh}
          size="sm"
          className="bg-white hover:bg-gray-100 text-red-600 font-semibold"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default NewPostsNotification;
