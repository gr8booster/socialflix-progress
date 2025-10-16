import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link2, Check, X } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Connections = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  const platforms = [
    { id: 'tiktok', name: 'TikTok', color: '#000000', icon: '📱', description: 'Watch viral TikTok videos' },
    { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '👥', description: 'View Facebook posts and videos' },
    { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: '📸', description: 'Browse Instagram Reels and photos' },
    { id: 'twitter', name: 'Twitter/X', color: '#1DA1F2', icon: '🐦', description: 'Full Twitter videos and tweets' },
    { id: 'threads', name: 'Threads', color: '#000000', icon: '🧵', description: 'Threads posts and updates' },
    { id: 'snapchat', name: 'Snapchat', color: '#FFFC00', icon: '👻', description: 'Snapchat Spotlight videos' },
    { id: 'pinterest', name: 'Pinterest', color: '#E60023', icon: '📌', description: 'Pinterest Pins and videos' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: '💼', description: 'LinkedIn professional content' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '▶️', description: 'Already connected (API)', connected: true },
    { id: 'reddit', name: 'Reddit', color: '#FF4500', icon: '🔥', description: 'Already connected (API)', connected: true },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    } else if (user) {
      fetchConnections();
    }
  }, [user, authLoading]);

  const fetchConnections = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/connected-platforms`, {
        withCredentials: true
      });
      setConnectedPlatforms(response.data.map(c => c.platform));
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platformId) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to connect platforms",
        duration: 3000,
      });
      return;
    }

    // Redirect to OAuth
    window.location.href = `${BACKEND_URL}/api/oauth/${platformId}/login`;
  };

  if (authLoading || loading) {
    return (
      <div className=\"min-h-screen bg-black flex items-center justify-center\">
        <div className=\"text-white text-xl\">Loading...</div>
      </div>
    );
  }

  const isConnected = (platformId) => {
    return connectedPlatforms.includes(platformId) || 
           platforms.find(p => p.id === platformId)?.connected;
  };

  return (
    <div className=\"min-h-screen bg-black text-white\">
      <Navbar />
      
      <div className=\"pt-24 px-8 md:px-16 pb-16 max-w-6xl mx-auto\">
        {/* Header */}
        <div className=\"mb-8\">
          <h1 className=\"text-4xl font-bold mb-2 flex items-center gap-3\">
            <Link2 className=\"w-10 h-10 text-purple-600\" />
            Connect Your Social Media
          </h1>
          <p className=\"text-gray-400 text-lg\">
            Connect your accounts to view personalized content from all platforms in ChyllApp
          </p>
        </div>

        {/* Stats */}
        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 mb-8\">
          <Card className=\"bg-gradient-to-br from-green-900/20 to-green-600/20 border-green-600/30\">
            <CardContent className=\"p-6 text-center\">
              <div className=\"text-4xl font-bold text-green-500 mb-1\">
                {connectedPlatforms.length + 2}
              </div>
              <div className=\"text-gray-400 text-sm\">Connected</div>
            </CardContent>
          </Card>
          <Card className=\"bg-gradient-to-br from-gray-900/20 to-gray-600/20 border-gray-600/30\">
            <CardContent className=\"p-6 text-center\">
              <div className=\"text-4xl font-bold text-gray-400 mb-1\">
                {8 - connectedPlatforms.length}
              </div>
              <div className=\"text-gray-400 text-sm\">Available</div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Cards */}
        <div className=\"grid md:grid-cols-2 gap-6\">
          {platforms.map((platform) => (
            <Card 
              key={platform.id}
              className={`border-2 transition-all ${\n                isConnected(platform.id)\n                  ? 'bg-gradient-to-br from-green-900/20 to-green-600/10 border-green-600/50'\n                  : 'bg-gray-900 border-gray-800 hover:border-gray-700'\n              }`}
            >
              <CardHeader>
                <CardTitle className=\"flex items-center justify-between\">
                  <div className=\"flex items-center gap-3\">
                    <span className=\"text-4xl\">{platform.icon}</span>
                    <div>
                      <div className=\"text-white text-xl\">{platform.name}</div>
                      <div className=\"text-gray-400 text-sm font-normal\">{platform.description}</div>
                    </div>
                  </div>
                  {isConnected(platform.id) && (
                    <div className=\"flex items-center gap-2 text-green-500\">
                      <Check className=\"w-5 h-5\" />
                      <span className=\"text-sm font-semibold\">Connected</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isConnected(platform.id) ? (
                  <div className=\"space-y-2\">
                    <div className=\"text-sm text-gray-400\">
                      ✅ Fetching personalized content every 5 minutes
                    </div>
                    {!platform.connected && (
                      <Button
                        variant=\"outline\"
                        className=\"w-full border-red-600 text-red-600 hover:bg-red-600/10\"
                        onClick={() => {\n                          toast({\n                            title: \"Disconnect Feature\",\n                            description: \"Visit Profile to manage connections\",\n                          });\n                        }}
                      >
                        Manage Connection
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={() => handleConnect(platform.id)}
                    className=\"w-full font-semibold\"
                    style={{ backgroundColor: platform.color }}
                  >
                    Connect {platform.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Box */}
        <Card className=\"bg-blue-900/20 border-blue-600/30 mt-8\">
          <CardContent className=\"p-6\">
            <h3 className=\"text-white font-bold text-lg mb-2\">🔒 Your Privacy Matters</h3>
            <p className=\"text-gray-300 text-sm\">
              We only request access to <strong>view content</strong>, never to post on your behalf. 
              You can disconnect any platform at any time. All connections are encrypted and secure.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Connections;
