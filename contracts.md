# SocialFlix - API Contracts & Integration Plan

## Current Frontend Mock Data
The frontend currently uses `mockData.js` with 18 viral posts across 6 platforms:
- Instagram: 3 posts
- Twitter/X: 3 posts  
- TikTok: 3 posts
- YouTube: 3 posts
- Facebook: 3 posts
- LinkedIn: 3 posts

## Backend Implementation Plan

### 1. Database Schema

#### Posts Collection
```javascript
{
  _id: ObjectId,
  platform: String,          // 'instagram', 'twitter', 'tiktok', 'youtube', 'facebook', 'linkedin'
  platformColor: String,     // Hex color for UI
  user: {
    name: String,
    username: String,
    avatar: String           // URL
  },
  content: String,           // Post text/caption
  media: {
    type: String,            // 'image' or 'video'
    url: String,             // Media URL
    thumbnail: String        // For videos
  },
  likes: Number,
  comments: Number,
  shares: Number,
  timestamp: String,         // Human readable (e.g., "2 hours ago")
  category: String,          // 'trending', 'viral', 'most-liked'
  createdAt: Date,
  updatedAt: Date
}
```

#### User Favorites Collection (Future)
```javascript
{
  _id: ObjectId,
  userId: String,
  postId: ObjectId,
  createdAt: Date
}
```

#### User Interactions Collection (Future)
```javascript
{
  _id: ObjectId,
  userId: String,
  postId: ObjectId,
  type: String,              // 'like', 'comment', 'share'
  comment: String,           // If type is 'comment'
  createdAt: Date
}
```

### 2. API Endpoints

#### GET /api/posts
- **Purpose**: Fetch all posts with optional filters
- **Query Params**: 
  - `platform` (optional): Filter by platform
  - `category` (optional): Filter by category
  - `limit` (optional): Number of posts to return
- **Response**: Array of post objects
- **Frontend Usage**: Load carousels for each section

#### GET /api/posts/featured
- **Purpose**: Get the featured post for hero section
- **Response**: Single post object
- **Frontend Usage**: Hero component

#### GET /api/posts/:id
- **Purpose**: Get single post details
- **Response**: Single post object
- **Frontend Usage**: Post modal

#### POST /api/posts/:id/like
- **Purpose**: Like/unlike a post
- **Request Body**: `{ userId: string }`
- **Response**: `{ likes: number, isLiked: boolean }`
- **Frontend Usage**: PostModal like button

#### POST /api/posts/:id/comment
- **Purpose**: Add a comment to a post
- **Request Body**: `{ userId: string, comment: string }`
- **Response**: `{ success: boolean, commentCount: number }`
- **Frontend Usage**: PostModal comment input

#### POST /api/posts/:id/share
- **Purpose**: Track post shares
- **Request Body**: `{ userId: string }`
- **Response**: `{ shares: number }`
- **Frontend Usage**: PostModal share button

#### GET /api/platforms
- **Purpose**: Get list of available platforms with metadata
- **Response**: Array of platform info objects
- **Frontend Usage**: Platform filters/navigation

### 3. Frontend Integration Changes

#### Remove Mock Data
- Delete mock data imports from components
- Replace with API calls using axios

#### Update Components

**Home.jsx**
```javascript
// Replace mockViralPosts import with API calls
useEffect(() => {
  fetchPosts();
}, []);

const fetchPosts = async () => {
  const response = await axios.get(`${API}/posts`);
  setPosts(response.data);
};
```

**Hero.jsx**
```javascript
// Replace getFeaturedPost() with API call
useEffect(() => {
  fetchFeaturedPost();
}, []);

const fetchFeaturedPost = async () => {
  const response = await axios.get(`${API}/posts/featured`);
  setFeaturedPost(response.data);
};
```

**PostModal.jsx**
```javascript
// Replace local state with API calls
const handleLike = async () => {
  const response = await axios.post(`${API}/posts/${post.id}/like`, {
    userId: 'current-user-id'
  });
  setLocalLikes(response.data.likes);
};
```

### 4. Data Seeding

Create a seed script to populate MongoDB with the current mock data from `mockData.js`. This ensures:
- Immediate data availability after backend is ready
- Consistent data between frontend mock and backend database
- Easy testing of API endpoints

### 5. Future Integration Points

#### Social Media Scraper Integration
- POST /api/scraper/fetch - Trigger scraper to fetch new posts
- POST /api/scraper/schedule - Set up periodic scraping
- GET /api/scraper/status - Check scraper status

#### User Authentication (Future)
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

#### User Profile (Future)
- GET /api/users/:id/favorites
- POST /api/users/:id/favorites/:postId
- DELETE /api/users/:id/favorites/:postId

## Implementation Order

1. ✅ Create MongoDB models for Posts
2. ✅ Implement GET /api/posts endpoint with filters
3. ✅ Implement GET /api/posts/featured endpoint
4. ✅ Create data seeding script
5. ✅ Test endpoints with curl/Postman
6. ✅ Update frontend to use API instead of mockData
7. ✅ Implement interaction endpoints (like, comment, share)
8. ✅ Test full integration
9. ⏳ Future: Social media scraper integration
10. ⏳ Future: User authentication
11. ⏳ Future: User favorites and personalization

## Notes
- All data is currently **MOCKED** for MVP demonstration
- Real social media integration will be added later with scraper service
- User authentication is not implemented yet - using placeholder user IDs
- All interactions (likes, comments, shares) are simulated for now
