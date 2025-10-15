import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, User, Edit2, Save, Bookmark, Activity } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [favoritePosts, setFavoritePosts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const platforms = ['reddit', 'youtube', 'twitter', 'instagram', 'tiktok', 'facebook', 'threads', 'snapchat', 'pinterest', 'linkedin'];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    } else if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setSelectedPlatforms(user.favorite_platforms || []);
      fetchFavorites();
      fetchActivities();
    }
  }, [user, loading, navigate]);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/favorites`, {
        withCredentials: true
      });
      setFavoritePosts(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/user/activity?limit=20`, {
        withCredentials: true
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/user/profile`,
        { name, bio },
        { withCredentials: true }
      );
      
      setIsEditing(false);
      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleTogglePlatform = async (platform) => {
    const newPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter(p => p !== platform)
      : [...selectedPlatforms, platform];
    
    setSelectedPlatforms(newPlatforms);
    
    try {
      await axios.put(
        `${BACKEND_URL}/api/user/preferences`,
        { favorite_platforms: newPlatforms },
        { withCredentials: true }
      );
      
      toast({
        title: "Preferences Updated!",
        description: `${platform} ${newPlatforms.includes(platform) ? 'added to' : 'removed from'} favorites`,
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="pt-24 px-8 md:px-16 pb-16 max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={user.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-red-600 object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-gray-900 border-gray-700 text-white text-2xl font-bold"
                  />
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-gray-900 border-gray-700 text-white resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="bg-red-600 hover:bg-red-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" className="border-gray-700">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="border-gray-700"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  <p className="text-gray-400 mb-4">{user.email}</p>
                  <p className="text-gray-300">{user.bio || 'No bio yet. Click Edit Profile to add one!'}</p>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{favoritePosts.length}</div>
                <div className="text-sm text-gray-400">Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{selectedPlatforms.length}</div>
                <div className="text-sm text-gray-400">Platforms</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="bg-gray-900 border-b border-gray-800">
            <TabsTrigger value="saved" className="data-[state=active]:bg-red-600">
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Posts
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-red-600">
              <Heart className="w-4 h-4 mr-2" />
              Favorite Platforms
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-red-600">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Saved Posts Tab */}
          <TabsContent value="saved" className="mt-8">
            {loadingFavorites ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600 mb-4"></div>
                <div className="text-white">Loading saved posts...</div>
              </div>
            ) : favoritePosts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {favoritePosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onClick={(p) => setSelectedPost(p)}
                    isGridLayout={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No saved posts yet</h3>
                <p className="text-gray-500 mb-6">Start saving your favorite posts to see them here</p>
                <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
                  Discover Posts
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Favorite Platforms Tab */}
          <TabsContent value="preferences" className="mt-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Choose Your Favorite Platforms</CardTitle>
                <p className="text-gray-400 text-sm">Select platforms to customize your feed</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {platforms.map((platform) => (
                    <Button
                      key={platform}
                      onClick={() => handleTogglePlatform(platform)}
                      variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                      className={`${
                        selectedPlatforms.includes(platform)
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
                      } capitalize`}
                    >
                      {platform}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-8">
            {loadingActivities ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600 mb-4"></div>
                <div className="text-white">Loading activity...</div>
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <Card key={activity.id} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.action === 'favorite' ? 'bg-red-600/20' :
                            activity.action === 'like' ? 'bg-pink-600/20' :
                            activity.action === 'comment' ? 'bg-blue-600/20' :
                            'bg-green-600/20'
                          }`}>
                            {activity.action === 'favorite' && <Bookmark className="w-5 h-5 text-red-600" />}
                            {activity.action === 'like' && <Heart className="w-5 h-5 text-pink-600" />}
                            {activity.action === 'comment' && <span className="text-blue-600">💬</span>}
                            {activity.action === 'share' && <span className="text-green-600">📤</span>}
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">
                              {activity.action === 'unfavorite' ? 'Removed from favorites' : 
                               activity.action === 'favorite' ? 'Saved to favorites' :
                               `${activity.action}d a post`}
                            </p>
                            <p className="text-gray-500 text-sm">{formatActivityTime(activity.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No activity yet</h3>
                <p className="text-gray-500">Your interactions will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
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

export default Profile;
