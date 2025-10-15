import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Code, Key, Trash2, Copy, Check, Plus, BookOpen } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Developer = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    } else if (user) {
      fetchApiKeys();
    }
  }, [user, authLoading]);

  const fetchApiKeys = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/developer/keys`, {
        withCredentials: true
      });
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your API key",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/developer/keys`,
        { name: newKeyName, rate_limit: 1000 },
        { withCredentials: true }
      );

      // Show full API key once (can't be retrieved again)
      toast({
        title: "API Key Created!",
        description: `${response.data.api_key} - Copy it now! You won't see it again.`,
        duration: 30000,
      });

      setNewKeyName('');
      fetchApiKeys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const handleRevokeKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/api/developer/keys/${keyId}`, {
        withCredentials: true
      });
      toast({
        title: "Key Revoked",
        description: "API key has been revoked",
      });
      fetchApiKeys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke key",
        variant: "destructive"
      });
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

      <div className="pt-24 px-8 md:px-16 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Code className="w-10 h-10 text-purple-600" />
            Developer API
          </h1>
          <p className="text-gray-400">Integrate ChyllApp into your applications</p>
        </div>

        {/* API Documentation Link */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-600/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  API Documentation
                </h3>
                <p className="text-gray-400">Learn how to integrate ChyllApp API into your applications</p>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                View Docs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create API Key */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Create New API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="API Key Name (e.g., Production App)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 bg-gray-800 border-gray-700 text-white"
              />
              <Button
                onClick={handleCreateKey}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Key
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No API keys yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{key.name}</p>
                      <code className="text-gray-400 text-sm font-mono">{key.key}</code>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Usage: {key.usage_count} / {key.rate_limit}/hr
                        </span>
                        <span className="text-xs text-gray-500">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopyKey(key.key)}
                        className="border-gray-700"
                      >
                        {copiedKey === key.key ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleRevokeKey(key.id)}
                        className="border-gray-700 hover:border-red-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Usage Examples */}
        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Quick Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-950 p-4 rounded-lg">
              <pre className="text-green-400 text-sm overflow-x-auto">
{`// Get trending posts
fetch('${BACKEND_URL}/api/posts?category=viral&limit=10', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Search posts
fetch('${BACKEND_URL}/api/search?q=viral&platform=youtube', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(res => res.json())
.then(data => console.log(data));`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Developer;
