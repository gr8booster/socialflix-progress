import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, Heart, MessageCircle, Share2, Users } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Creator = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    } else if (user) {
      fetchCreatorStats();
    }
  }, [user, authLoading]);

  const fetchCreatorStats = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/creator/stats`, {
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching creator stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-8 md:px-16 pb-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-pink-600" />
            Creator Dashboard
          </h1>
          <p className="text-gray-400">Track your engagement and performance</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Engagement</p>
                    <p className="text-3xl font-bold text-white">{stats.total_engagement}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Likes Given</p>
                    <p className="text-3xl font-bold text-white">{stats.likes_given}</p>
                  </div>
                  <Heart className="w-10 h-10 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Comments</p>
                    <p className="text-3xl font-bold text-white">{stats.comments_given}</p>
                  </div>
                  <MessageCircle className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Shares</p>
                    <p className="text-3xl font-bold text-white">{stats.shares_given}</p>
                  </div>
                  <Share2 className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coming Soon */}
        <Card className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-pink-600/30">
          <CardContent className="p-8 text-center">
            <Users className="w-16 h-16 text-pink-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">More Creator Tools Coming Soon!</h2>
            <p className="text-gray-400 mb-4">
              Cross-platform posting, audience insights, and monetization tracking are in development.
            </p>
            <p className="text-sm text-gray-500">
              Check back soon for updates!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Creator;
