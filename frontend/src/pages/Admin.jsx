import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Database, TrendingUp, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Admin = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchingYoutube, setFetchingYoutube] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/scraper/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch scraper status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRedditPosts = async () => {
    try {
      setFetching(true);
      toast({
        title: "Fetching Reddit Posts...",
        description: "This may take a few seconds",
      });

      const response = await axios.post(`${API}/scraper/fetch-reddit?limit=50`);
      
      if (response.data.success) {
        toast({
          title: "Success!",
          description: `Added ${response.data.posts_added} new Reddit posts`,
        });
        // Refresh status
        await fetchStatus();
      } else {
        toast({
          title: "No New Posts",
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Reddit posts",
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  };

  const fetchYouTubeVideos = async () => {
    try {
      setFetchingYoutube(true);
      toast({
        title: "Fetching YouTube Videos...",
        description: "This may take a few seconds",
      });

      const response = await axios.post(`${API}/scraper/fetch-youtube?limit=50`);
      
      if (response.data.success) {
        toast({
          title: "Success!",
          description: `Added ${response.data.posts_added} new YouTube videos`,
        });
        // Refresh status
        await fetchStatus();
      } else {
        toast({
          title: "No New Videos",
          description: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch YouTube videos",
        variant: "destructive"
      });
    } finally {
      setFetchingYoutube(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">ChyllApp Admin</h1>
          <p className="text-gray-400">Manage viral content and scraper settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold text-white">
                    {loading ? '...' : status?.total_posts || 0}
                  </p>
                </div>
                <Database className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Reddit Posts</p>
                  <p className="text-3xl font-bold text-white">
                    {loading ? '...' : status?.reddit_posts || 0}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">YouTube Posts</p>
                  <p className="text-3xl font-bold text-white">
                    {loading ? '...' : status?.youtube_posts || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white text-xl">▶</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Mock Posts</p>
                  <p className="text-3xl font-bold text-white">
                    {loading ? '...' : status?.mock_posts || 0}
                  </p>
                </div>
                <Users className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Scraper Status</p>
                  <p className="text-xl font-bold text-green-500">
                    {loading ? '...' : status?.scraper_ready ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${status?.scraper_ready ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reddit Scraper */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  🔥
                </div>
                Reddit Scraper
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fetch viral content from r/popular
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Click below to fetch the latest trending posts from Reddit. This will add new viral content to your database.
              </p>
              <Button 
                onClick={fetchRedditPosts}
                disabled={fetching}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {fetching ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch Reddit Posts
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* YouTube Scraper */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                  ▶
                </div>
                YouTube Scraper
              </CardTitle>
              <CardDescription className="text-gray-400">
                Fetch trending videos from YouTube
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Click below to fetch the latest trending videos from YouTube. This will add popular video content to your database.
              </p>
              <Button 
                onClick={fetchYouTubeVideos}
                disabled={fetchingYoutube}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {fetchingYoutube ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Fetch YouTube Videos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Database Info */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-500" />
                Database Info
              </CardTitle>
              <CardDescription className="text-gray-400">
                Current database statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                  <span className="text-gray-300">Total Posts</span>
                  <span className="text-white font-semibold">{status?.total_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                  <span className="text-gray-300">Reddit Posts</span>
                  <span className="text-orange-500 font-semibold">{status?.reddit_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                  <span className="text-gray-300">YouTube Posts</span>
                  <span className="text-red-500 font-semibold">{status?.youtube_posts || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900 rounded-lg">
                  <span className="text-gray-300">Mock Posts</span>
                  <span className="text-green-500 font-semibold">{status?.mock_posts || 0}</span>
                </div>
              </div>
              <Button 
                onClick={fetchStatus}
                variant="outline"
                disabled={loading}
                className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">1.</span>
                <span>Click "Fetch Reddit Posts" to scrape viral content from Reddit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">2.</span>
                <span>New posts will be added to your database automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">3.</span>
                <span>Go back to the home page to see the new viral content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">4.</span>
                <span>The scraper avoids duplicates - you can run it multiple times</span>
              </li>
            </ul>
            <div className="mt-4">
              <a href="/" className="text-blue-400 hover:text-blue-300 underline">
                ← Back to Home
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  );
};

export default Admin;
