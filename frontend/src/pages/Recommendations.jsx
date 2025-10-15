import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Recommendations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchRecommendations();
    fetchTrendingTopics();
  }, [user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/recommendations?limit=20`, {
        withCredentials: true
      });
      setRecommendedPosts(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/trending/topics?limit=5`);
      setTrendingTopics(response.data);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-24 px-8 md:px-16 pb-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-yellow-500" />
            {user ? 'For You' : 'Trending Now'}
          </h1>
          <p className="text-gray-400">
            {user 
              ? 'AI-powered recommendations based on your interests' 
              : 'Popular content across all platforms'}
          </p>
        </div>

        {/* Trending Topics */}
        {trendingTopics.length > 0 && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTopics ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trendingTopics.map((topic, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-600/30 rounded-full"
                    >
                      <span className="text-white font-medium">#{topic.topic}</span>
                      <span className="text-gray-400 text-sm ml-2">({topic.count})</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recommended Posts */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-white text-lg">
                {user ? 'Analyzing your interests...' : 'Loading trending content...'}
              </p>
            </div>
          </div>
        ) : recommendedPosts.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {user ? 'Recommended For You' : 'Most Engaging Posts'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recommendedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={(p) => setSelectedPost(p)}
                  isGridLayout={true}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No recommendations yet</h3>
            <p className="text-gray-500">Start liking and saving posts to get personalized recommendations!</p>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default Recommendations;
