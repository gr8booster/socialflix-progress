import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Heart, MessageCircle, Share2, Download, Video, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ['#FF0000', '#FF4500', '#1DA1F2', '#E4405F', '#000000', '#1877F2', '#00D9FF', '#FFFC00', '#E60023', '#0A66C2'];

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [platformStats, setPlatformStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, platformsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/analytics/overview`),
        axios.get(`${BACKEND_URL}/api/analytics/platforms`)
      ]);
      
      setOverview(overviewRes.data);
      setPlatformStats(platformsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/analytics/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'chyllapp_analytics.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'chyllapp_analytics.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  const platformChartData = platformStats.map(p => ({
    name: p.platform.toUpperCase(),
    posts: p.posts,
    likes: p.likes,
    comments: p.comments
  }));

  const pieData = platformStats.map(p => ({
    name: p.platform.toUpperCase(),
    value: p.posts
  }));

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-24 px-8 md:px-16 pb-16 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-red-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">Platform performance and engagement metrics</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExport('json')} variant="outline" className="border-gray-700">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button onClick={() => handleExport('csv')} variant="outline" className="border-gray-700">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Posts</p>
                    <p className="text-3xl font-bold text-white">{overview.total_posts}</p>
                  </div>
                  <Users className="w-10 h-10 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Likes</p>
                    <p className="text-3xl font-bold text-white">{(overview.total_likes / 1000000).toFixed(1)}M</p>
                  </div>
                  <Heart className="w-10 h-10 text-pink-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Comments</p>
                    <p className="text-3xl font-bold text-white">{(overview.total_comments / 1000).toFixed(1)}K</p>
                  </div>
                  <MessageCircle className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Videos</p>
                    <p className="text-3xl font-bold text-white">{overview.total_videos}</p>
                  </div>
                  <Video className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Performance Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Platform Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="posts" fill="#EF4444" name="Posts" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution Pie Chart */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Platform Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Platform Stats Table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Detailed Platform Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Platform</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Posts</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Videos</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Total Likes</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Avg Likes</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {platformStats.map((platform) => (
                    <tr key={platform.platform} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white uppercase">{platform.platform}</span>
                      </td>
                      <td className="py-3 px-4 text-white">{platform.posts}</td>
                      <td className="py-3 px-4 text-white">{platform.videos}</td>
                      <td className="py-3 px-4 text-white">{(platform.likes / 1000000).toFixed(1)}M</td>
                      <td className="py-3 px-4 text-white">{(platform.avg_likes / 1000).toFixed(1)}K</td>
                      <td className="py-3 px-4 text-white">{(platform.comments / 1000).toFixed(1)}K</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
