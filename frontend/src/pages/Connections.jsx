import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link2, Check } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const platforms = [
  { id: 'tiktok', name: 'TikTok', color: '#000000', icon: '📱', desc: 'Viral TikTok videos' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '👥', desc: 'Facebook posts' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: '📸', desc: 'Instagram Reels' },
  { id: 'twitter', name: 'Twitter/X', color: '#1DA1F2', icon: '🐦', desc: 'Twitter videos' },
  { id: 'threads', name: 'Threads', color: '#000000', icon: '🧵', desc: 'Threads posts' },
  { id: 'snapchat', name: 'Snapchat', color: '#FFFC00', icon: '👻', desc: 'Spotlight videos' },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023', icon: '📌', desc: 'Pinterest Pins' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: '💼', desc: 'Professional content' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '▶️', desc: 'Already connected', connected: true },
  { id: 'reddit', name: 'Reddit', color: '#FF4500', icon: '🔥', desc: 'Already connected', connected: true },
];

const Connections = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [connected, setConnected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    } else if (user) {
      fetchConnections();
    }
  }, [user, authLoading, navigate]);

  const fetchConnections = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/connected-platforms`, {
        withCredentials: true
      });
      setConnected(response.data.map(c => c.platform));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platformId) => {
    window.location.href = `${BACKEND_URL}/api/oauth/${platformId}/login`;
  };

  const isConnected = (id) => connected.includes(id) || platforms.find(p => p.id === id)?.connected;

  if (authLoading || loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 px-8 md:px-16 pb-16 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Link2 className="w-10 h-10 text-purple-600" />
          Connect Your Social Media
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Connect accounts to view personalized content from all platforms
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((p) => (
            <Card key={p.id} className={isConnected(p.id) ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900 border-gray-800'}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{p.icon}</span>
                    <div>
                      <div className="text-white text-xl">{p.name}</div>
                      <div className="text-gray-400 text-sm font-normal">{p.desc}</div>
                    </div>
                  </div>
                  {isConnected(p.id) && (
                    <div className="flex items-center gap-2 text-green-500">
                      <Check className="w-5 h-5" />
                      <span className="text-sm">Connected</span>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isConnected(p.id) && (
                  <Button
                    onClick={() => handleConnect(p.id)}
                    className="w-full font-semibold"
                    style={{ backgroundColor: p.color }}
                  >
                    Connect {p.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
