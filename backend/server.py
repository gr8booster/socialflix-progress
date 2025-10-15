from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Response, Cookie
from fastapi.responses import JSONResponse, RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from models import Post, PostCreate, LikeRequest, CommentRequest, ShareRequest, PlatformInfo, User, Session, SessionCreate, UserResponse, UserProfileUpdate, UserPreferences, ActivityItem, CustomFeed, CustomFeedCreate, NotificationPreferences, NotificationPreferencesUpdate, PlatformConnection
from seed_data import seed_posts, platform_info
from reddit_scraper import RedditScraper
from youtube_scraper import YouTubeScraper
from twitter_scraper import TwitterScraper
from instagram_scraper import InstagramScraper
from tiktok_scraper import TikTokScraper
from facebook_scraper import FacebookScraper
from threads_scraper import ThreadsScraper
from snapchat_scraper import SnapchatScraper
from pinterest_scraper import PinterestScraper
from linkedin_scraper import LinkedInScraper
from recommendation_engine import RecommendationEngine

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Helper function to seed database
async def seed_database():
    """Seed the database with mock viral posts if empty"""
    count = await db.posts.count_documents({})
    if count == 0:
        logger.info("Seeding database with mock viral posts...")
        for post_data in seed_posts:
            post = Post(**post_data)
            await db.posts.insert_one(post.dict())
        logger.info(f"Successfully seeded {len(seed_posts)} posts")
    else:
        logger.info(f"Database already contains {count} posts")


# Initialize scrapers
reddit_scraper = RedditScraper()
youtube_scraper = YouTubeScraper()
twitter_scraper = TwitterScraper()
instagram_scraper = InstagramScraper()
tiktok_scraper = TikTokScraper()
facebook_scraper = FacebookScraper()
threads_scraper = ThreadsScraper()
snapchat_scraper = SnapchatScraper()
pinterest_scraper = PinterestScraper()
linkedin_scraper = LinkedInScraper()
recommendation_engine = RecommendationEngine()

# Startup event to seed database
@app.on_event("startup")
async def startup_db():
    await seed_database()


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to ChyllApp API"}


@api_router.get("/posts", response_model=List[Post])
async def get_posts(
    platform: Optional[str] = Query(None, description="Filter by platform (comma-separated for multiple)"),
    category: Optional[str] = Query(None, description="Filter by category (comma-separated for multiple)"),
    time_range: Optional[str] = Query(None, description="Time range: today, week, month, all"),
    sort_by: Optional[str] = Query("date", description="Sort by: date, likes, comments, engagement"),
    limit: Optional[int] = Query(None, description="Limit number of results"),
    skip: Optional[int] = Query(0, description="Skip number of results for pagination")
):
    """Get all posts with advanced filters and pagination"""
    query = {}
    
    # Multi-platform filter
    if platform and platform != 'all':
        platforms = [p.strip() for p in platform.split(',')]
        if len(platforms) == 1:
            query["platform"] = platforms[0]
        else:
            query["platform"] = {"$in": platforms}
    
    # Multi-category filter
    if category and category != 'all':
        categories = [c.strip() for c in category.split(',')]
        if len(categories) == 1:
            query["category"] = categories[0]
        else:
            query["category"] = {"$in": categories}
    
    # Time range filter
    if time_range and time_range != 'all':
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        
        if time_range == 'today':
            start_time = now - timedelta(days=1)
        elif time_range == 'week':
            start_time = now - timedelta(days=7)
        elif time_range == 'month':
            start_time = now - timedelta(days=30)
        else:
            start_time = None
        
        if start_time:
            query["createdAt"] = {"$gte": start_time.isoformat()}
    
    # Determine sort order
    if sort_by == 'likes':
        sort_order = [("likes", -1)]
    elif sort_by == 'comments':
        sort_order = [("comments", -1)]
    elif sort_by == 'engagement':
        # Sort by total engagement (likes + comments + shares)
        sort_order = [("likes", -1)]  # Simplified, would need aggregation for true engagement
    else:  # date (default)
        sort_order = [("createdAt", -1)]
    
    posts_cursor = db.posts.find(query).sort(sort_order).skip(skip)
    
    if limit:
        posts_cursor = posts_cursor.limit(limit)
    
    posts = await posts_cursor.to_list(limit or 1000)
    return [Post(**post) for post in posts]


@api_router.get("/posts/featured", response_model=Post)
async def get_featured_post():
    """Get the featured post for hero section"""
    # Get the post with most likes from viral category
    # Prioritize platforms with real video content (YouTube, Reddit)
    post = await db.posts.find_one(
        {
            "category": "viral",
            "platform": {"$in": ["youtube", "reddit"]}
        },
        sort=[("likes", -1)]
    )
    
    if not post:
        # Fallback to viral posts from any fully integrated platform
        post = await db.posts.find_one(
            {
                "category": "viral",
                "platform": {"$in": ["youtube", "reddit", "twitter"]}
            },
            sort=[("likes", -1)]
        )
    
    if not post:
        # Final fallback to any viral post
        post = await db.posts.find_one(
            {"category": "viral"},
            sort=[("likes", -1)]
        )
    
    if not post:
        raise HTTPException(status_code=404, detail="No posts found")
    
    return Post(**post)


@api_router.get("/posts/new-count")
async def get_new_posts_count(
    since: str = Query(..., description="ISO timestamp to check for new posts since"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """Check how many new posts have been added since a given timestamp"""
    try:
        query = {"createdAt": {"$gt": since}}
        
        if platform:
            query["platform"] = platform
        if category:
            query["category"] = category
        
        count = await db.posts.count_documents(query)
        
        return {
            "new_count": count,
            "since": since,
            "has_new": count > 0
        }
    except Exception as e:
        logger.error(f"Error checking new posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/posts/{post_id}", response_model=Post)
async def get_post(post_id: str):
    """Get a single post by ID"""
    post = await db.posts.find_one({"id": post_id})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return Post(**post)


@api_router.post("/posts/{post_id}/like")
async def like_post(post_id: str, request: LikeRequest):
    """Like or unlike a post"""
    post = await db.posts.find_one({"id": post_id})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already liked (in a real app, check user_likes collection)
    # For now, just increment the like count
    new_likes = post["likes"] + 1
    
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {"likes": new_likes, "updatedAt": datetime.utcnow()}}
    )
    
    return {"likes": new_likes, "isLiked": True}


@api_router.post("/posts/{post_id}/comment")
async def comment_post(post_id: str, request: CommentRequest):
    """Add a comment to a post"""
    post = await db.posts.find_one({"id": post_id})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment comment count
    new_comments = post["comments"] + 1
    
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {"comments": new_comments, "updatedAt": datetime.utcnow()}}
    )
    
    # In a real app, save the comment to a comments collection
    logger.info(f"Comment from {request.userId}: {request.comment}")
    
    return {"success": True, "commentCount": new_comments}


@api_router.post("/posts/{post_id}/share")
async def share_post(post_id: str, request: ShareRequest):
    """Track post share"""
    post = await db.posts.find_one({"id": post_id})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Increment share count
    new_shares = post["shares"] + 1
    
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {"shares": new_shares, "updatedAt": datetime.utcnow()}}
    )
    
    return {"shares": new_shares}


@api_router.get("/platforms", response_model=List[PlatformInfo])
async def get_platforms():
    """Get list of available platforms"""
    platforms = platform_info + [
        {"platform": "reddit", "name": "Reddit", "color": "#FF4500", "icon": "🔥"}
    ]
    return [PlatformInfo(**p) for p in platforms]


@api_router.get("/search", response_model=List[Post])
async def search_posts(
    q: str = Query(..., description="Search query"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    sort_by: Optional[str] = Query("relevance", description="Sort by: relevance, date, likes, comments"),
    limit: Optional[int] = Query(50, description="Limit number of results")
):
    """
    Search posts by keywords in content and user names
    
    Args:
        q: Search query string
        platform: Optional platform filter
        sort_by: Sort order (relevance, date, likes, comments)
        limit: Maximum number of results
    """
    try:
        # Build search query
        search_query = {
            "$or": [
                {"content": {"$regex": q, "$options": "i"}},  # Case-insensitive search in content
                {"user.name": {"$regex": q, "$options": "i"}},  # Search in user names
                {"user.username": {"$regex": q, "$options": "i"}}  # Search in usernames
            ]
        }
        
        # Add platform filter if specified
        if platform:
            search_query["platform"] = platform
        
        # Define sort order
        sort_order = []
        if sort_by == "date":
            sort_order = [("createdAt", -1)]
        elif sort_by == "likes":
            sort_order = [("likes", -1)]
        elif sort_by == "comments":
            sort_order = [("comments", -1)]
        else:  # relevance (default)
            # For relevance, we'll just use creation date as a proxy
            sort_order = [("createdAt", -1)]
        
        # Execute search
        posts_cursor = db.posts.find(search_query).sort(sort_order).limit(limit)
        posts = await posts_cursor.to_list(limit)
        
        logger.info(f"Search query: '{q}', platform: {platform}, found: {len(posts)} results")
        
        return [Post(**post) for post in posts]
        
    except Exception as e:
        logger.error(f"Error searching posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching posts: {str(e)}")


@api_router.post("/scraper/fetch-reddit")
async def fetch_reddit_posts(limit: int = 50):
    """
    Fetch viral posts from Reddit and save to database
    
    Args:
        limit: Number of posts to fetch (default 50)
    """
    try:
        logger.info(f"Fetching {limit} posts from Reddit...")
        
        # Fetch posts from Reddit
        reddit_posts = reddit_scraper.fetch_viral_content(limit=limit)
        
        if not reddit_posts:
            return {
                "success": False,
                "message": "No posts fetched from Reddit",
                "posts_added": 0
            }
        
        # Save posts to database (avoid duplicates)
        posts_added = 0
        for post_data in reddit_posts:
            # Check if post already exists (by reddit_id if available)
            existing_post = await db.posts.find_one({"reddit_id": post_data.get("reddit_id")})
            
            if not existing_post:
                post = Post(**post_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new Reddit posts to database")
        
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} Reddit posts",
            "posts_added": posts_added,
            "total_fetched": len(reddit_posts)
        }
        
    except Exception as e:
        logger.error(f"Error fetching Reddit posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching Reddit posts: {str(e)}")


@api_router.post("/scraper/fetch-youtube")
async def fetch_youtube_videos(limit: int = 50):
    """
    Fetch trending videos from YouTube and save to database
    
    Args:
        limit: Number of videos to fetch (default 50, max 50)
    """
    try:
        logger.info(f"Fetching {limit} trending videos from YouTube...")
        
        # Fetch videos from YouTube
        youtube_videos = youtube_scraper.fetch_trending_videos(max_results=limit)
        
        if not youtube_videos:
            return {
                "success": False,
                "message": "No videos fetched from YouTube",
                "posts_added": 0
            }
        
        # Save videos to database (avoid duplicates)
        posts_added = 0
        for video_data in youtube_videos:
            # Check if video already exists (by youtube_id)
            existing_post = await db.posts.find_one({"youtube_id": video_data.get("youtube_id")})
            
            if not existing_post:
                post = Post(**video_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new YouTube videos to database")
        
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} YouTube videos",
            "posts_added": posts_added,
            "total_fetched": len(youtube_videos)
        }
        
    except Exception as e:
        logger.error(f"Error fetching YouTube videos: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching YouTube videos: {str(e)}")


@api_router.post("/scraper/fetch-twitter")
async def fetch_twitter_posts(limit: int = 50):
    """
    Fetch trending tweets from Twitter and save to database
    
    Args:
        limit: Number of tweets to fetch (default 50)
    """
    try:
        logger.info(f"Fetching {limit} trending tweets from Twitter...")
        
        # Fetch tweets from Twitter
        twitter_posts = twitter_scraper.fetch_trending_tweets(max_results=limit)
        
        if not twitter_posts:
            return {
                "success": False,
                "message": "No tweets fetched from Twitter",
                "posts_added": 0
            }
        
        # Save tweets to database (avoid duplicates)
        posts_added = 0
        for tweet_data in twitter_posts:
            # Check if tweet already exists (by twitter_id)
            existing_post = await db.posts.find_one({"twitter_id": tweet_data.get("twitter_id")})
            
            if not existing_post:
                post = Post(**tweet_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new Twitter posts to database")
        
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} Twitter posts",
            "posts_added": posts_added,
            "total_fetched": len(twitter_posts)
        }
        
    except Exception as e:
        logger.error(f"Error fetching Twitter posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching Twitter posts: {str(e)}")


@api_router.post("/scraper/fetch-instagram")
async def fetch_instagram_posts(limit: int = 50):
    """
    Fetch trending posts from Instagram and save to database
    
    Args:
        limit: Number of posts to fetch (default 50)
    """
    try:
        logger.info(f"Fetching {limit} trending posts from Instagram...")
        
        # Fetch posts from Instagram
        instagram_posts = instagram_scraper.fetch_trending_posts(max_results=limit)
        
        if not instagram_posts:
            return {
                "success": False,
                "message": "No posts fetched from Instagram",
                "posts_added": 0
            }
        
        # Save posts to database (avoid duplicates)
        posts_added = 0
        for post_data in instagram_posts:
            # Check if post already exists (by instagram_id)
            existing_post = await db.posts.find_one({"instagram_id": post_data.get("instagram_id")})
            
            if not existing_post:
                post = Post(**post_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new Instagram posts to database")
        
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} Instagram posts",
            "posts_added": posts_added,
            "total_fetched": len(instagram_posts)
        }
        
    except Exception as e:
        logger.error(f"Error fetching Instagram posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching Instagram posts: {str(e)}")


@api_router.post("/scraper/fetch-tiktok")
async def fetch_tiktok_videos(limit: int = 50):
    """Fetch trending videos from TikTok and save to database"""
    try:
        logger.info(f"Fetching {limit} trending videos from TikTok...")
        tiktok_videos = tiktok_scraper.fetch_trending_videos(max_results=limit)
        
        if not tiktok_videos:
            return {"success": False, "message": "No videos fetched from TikTok", "posts_added": 0}
        
        posts_added = 0
        for video_data in tiktok_videos:
            existing_post = await db.posts.find_one({"tiktok_id": video_data.get("tiktok_id")})
            if not existing_post:
                post = Post(**video_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new TikTok videos to database")
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} TikTok videos",
            "posts_added": posts_added,
            "total_fetched": len(tiktok_videos)
        }
    except Exception as e:
        logger.error(f"Error fetching TikTok videos: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching TikTok videos: {str(e)}")


@api_router.post("/scraper/fetch-facebook")
async def fetch_facebook_posts(limit: int = 50):
    """Fetch trending posts from Facebook and save to database"""
    try:
        logger.info(f"Fetching {limit} trending posts from Facebook...")
        facebook_posts = facebook_scraper.fetch_trending_posts(max_results=limit)
        
        if not facebook_posts:
            return {"success": False, "message": "No posts fetched from Facebook", "posts_added": 0}
        
        posts_added = 0
        for post_data in facebook_posts:
            existing_post = await db.posts.find_one({"facebook_id": post_data.get("facebook_id")})
            if not existing_post:
                post = Post(**post_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new Facebook posts to database")
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} Facebook posts",
            "posts_added": posts_added,
            "total_fetched": len(facebook_posts)
        }
    except Exception as e:
        logger.error(f"Error fetching Facebook posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching Facebook posts: {str(e)}")


@api_router.post("/scraper/fetch-threads")
async def fetch_threads_posts(limit: int = 50):
    """Fetch trending posts from Threads and save to database"""
    try:
        logger.info(f"Fetching {limit} trending posts from Threads...")
        threads_posts = threads_scraper.fetch_trending_posts(max_results=limit)
        
        if not threads_posts:
            return {"success": False, "message": "No posts fetched from Threads", "posts_added": 0}
        
        posts_added = 0
        for post_data in threads_posts:
            existing_post = await db.posts.find_one({"threads_id": post_data.get("threads_id")})
            if not existing_post:
                post = Post(**post_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new Threads posts to database")
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} Threads posts",
            "posts_added": posts_added,
            "total_fetched": len(threads_posts)
        }
    except Exception as e:
        logger.error(f"Error fetching Threads posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching Threads posts: {str(e)}")


@api_router.post("/scraper/fetch-snapchat")
async def fetch_snapchat_content(limit: int = 50):
    """Fetch trending content from Snapchat and save to database"""
    try:
        logger.info(f"Fetching {limit} trending content from Snapchat...")
        snapchat_content = snapchat_scraper.fetch_trending_content(max_results=limit)
        
        if not snapchat_content:
            return {"success": False, "message": "No content fetched from Snapchat", "posts_added": 0}
        
        posts_added = 0
        for post_data in snapchat_content:
            existing_post = await db.posts.find_one({"snapchat_id": post_data.get("snapchat_id")})
            if not existing_post:
                post = Post(**post_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new Snapchat posts to database")
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} Snapchat content",
            "posts_added": posts_added,
            "total_fetched": len(snapchat_content)
        }
    except Exception as e:
        logger.error(f"Error fetching Snapchat content: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching Snapchat content: {str(e)}")


@api_router.post("/scraper/fetch-pinterest")
async def fetch_pinterest_pins(limit: int = 50):
    """Fetch trending pins from Pinterest and save to database"""
    try:
        logger.info(f"Fetching {limit} trending pins from Pinterest...")
        pinterest_pins = pinterest_scraper.fetch_trending_pins(max_results=limit)
        
        if not pinterest_pins:
            return {"success": False, "message": "No pins fetched from Pinterest", "posts_added": 0}
        
        posts_added = 0
        for pin_data in pinterest_pins:
            existing_post = await db.posts.find_one({"pinterest_id": pin_data.get("pinterest_id")})
            if not existing_post:
                post = Post(**pin_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new Pinterest pins to database")
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} Pinterest pins",
            "posts_added": posts_added,
            "total_fetched": len(pinterest_pins)
        }
    except Exception as e:
        logger.error(f"Error fetching Pinterest pins: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching Pinterest pins: {str(e)}")


@api_router.post("/scraper/fetch-linkedin")
async def fetch_linkedin_posts(limit: int = 50):
    """Fetch trending posts from LinkedIn and save to database"""
    try:
        logger.info(f"Fetching {limit} trending posts from LinkedIn...")
        linkedin_posts = linkedin_scraper.fetch_trending_posts(max_results=limit)
        
        if not linkedin_posts:
            return {"success": False, "message": "No posts fetched from LinkedIn", "posts_added": 0}
        
        posts_added = 0
        for post_data in linkedin_posts:
            existing_post = await db.posts.find_one({"linkedin_id": post_data.get("linkedin_id")})
            if not existing_post:
                post = Post(**post_data)
                await db.posts.insert_one(post.dict())
                posts_added += 1
        
        logger.info(f"Successfully added {posts_added} new LinkedIn posts to database")
        return {
            "success": True,
            "message": f"Successfully fetched and saved {posts_added} LinkedIn posts",
            "posts_added": posts_added,
            "total_fetched": len(linkedin_posts)
        }
    except Exception as e:
        logger.error(f"Error fetching LinkedIn posts: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching LinkedIn posts: {str(e)}")


@api_router.get("/scraper/status")
async def scraper_status():
    """Get status of scraper and database"""
    try:
        total_posts = await db.posts.count_documents({})
        reddit_posts = await db.posts.count_documents({"platform": "reddit"})
        youtube_posts = await db.posts.count_documents({"platform": "youtube"})
        twitter_posts = await db.posts.count_documents({"platform": "twitter"})
        instagram_posts = await db.posts.count_documents({"platform": "instagram"})
        tiktok_posts = await db.posts.count_documents({"platform": "tiktok"})
        facebook_posts = await db.posts.count_documents({"platform": "facebook"})
        threads_posts = await db.posts.count_documents({"platform": "threads"})
        snapchat_posts = await db.posts.count_documents({"platform": "snapchat"})
        pinterest_posts = await db.posts.count_documents({"platform": "pinterest"})
        linkedin_posts = await db.posts.count_documents({"platform": "linkedin"})
        mock_posts = total_posts - reddit_posts - youtube_posts - twitter_posts - instagram_posts - tiktok_posts - facebook_posts - threads_posts - snapchat_posts - pinterest_posts - linkedin_posts
        
        return {
            "status": "active",
            "total_posts": total_posts,
            "reddit_posts": reddit_posts,
            "youtube_posts": youtube_posts,
            "twitter_posts": twitter_posts,
            "instagram_posts": instagram_posts,
            "tiktok_posts": tiktok_posts,
            "facebook_posts": facebook_posts,
            "threads_posts": threads_posts,
            "snapchat_posts": snapchat_posts,
            "pinterest_posts": pinterest_posts,
            "linkedin_posts": linkedin_posts,
            "mock_posts": mock_posts,
            "scraper_ready": True
        }
    except Exception as e:
        logger.error(f"Error getting scraper status: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


# ============ Authentication Endpoints ============

async def get_current_user_from_token(session_token: Optional[str] = None) -> Optional[dict]:
    """
    Helper function to get current user from session_token
    Checks session validity and returns user data
    """
    if not session_token:
        return None
    
    try:
        # Find active session
        session = await db.sessions.find_one({
            "session_token": session_token,
            "expires_at": {"$gt": datetime.now(timezone.utc).isoformat()}
        })
        
        if not session:
            return None
        
        # Get user data
        user = await db.users.find_one({"id": session["user_id"]})
        return user
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return None


@api_router.post("/auth/session")
async def create_session(request: Request, response: Response, session_data: SessionCreate):
    """
    Process session_id from Emergent OAuth and create user session
    """
    try:
        # Call Emergent Auth API to get session data
        async with httpx.AsyncClient() as client:
            logger.info(f"Validating session with Emergent Auth...")
            
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_data.session_id},
                timeout=15.0
            )
            
            logger.info(f"Auth response status: {auth_response.status_code}")
            
            if auth_response.status_code != 200:
                logger.error(f"Auth error: {auth_response.text}")
                raise HTTPException(
                    status_code=400,
                    detail="Invalid or expired session"
                )
            
            auth_data = auth_response.json()
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": auth_data["email"]})
        
        if existing_user:
            user_id = existing_user["id"]
            logger.info(f"User logged in: {auth_data['email']}")
        else:
            # Create new user
            new_user = User(
                email=auth_data["email"],
                name=auth_data["name"],
                picture=auth_data.get("picture"),
                google_id=auth_data.get("id")
            )
            user_dict = new_user.dict()
            user_dict["created_at"] = new_user.created_at.isoformat()
            user_dict["updated_at"] = new_user.updated_at.isoformat()
            
            await db.users.insert_one(user_dict)
            user_id = new_user.id
            logger.info(f"New user created: {auth_data['email']}")
        
        # Create session
        session_token = auth_data["session_token"]
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        new_session = Session(
            user_id=user_id,
            session_token=session_token,
            expires_at=expires_at
        )
        
        session_dict = new_session.dict()
        session_dict["expires_at"] = expires_at.isoformat()
        session_dict["created_at"] = new_session.created_at.isoformat()
        
        await db.sessions.insert_one(session_dict)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,
            path="/"
        )
        
        user = await db.users.find_one({"id": user_id})
        
        return {
            "success": True,
            "user": UserResponse(**user).dict()
        }
        
    except Exception as e:
        logger.error(f"Session error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """
    Get current authenticated user from session_token
    Checks cookie first, then Authorization header as fallback
    """
    # Try cookie first
    token = session_token
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return UserResponse(**user)


@api_router.post("/auth/logout")
async def logout(
    response: Response,
    session_token: Optional[str] = Cookie(None)
):
    """
    Logout user by deleting session and clearing cookie
    """
    if session_token:
        # Delete session from database
        await db.sessions.delete_one({"session_token": session_token})
    
    # Clear cookie
    response.delete_cookie(
        key="session_token",
        path="/",
        samesite="none",
        secure=True
    )
    
    return {"success": True, "message": "Logged out successfully"}


# ============ User Profile & Favorites Endpoints ============

@api_router.get("/user/profile", response_model=UserResponse)
async def get_user_profile(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get authenticated user's profile"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return UserResponse(**user)


@api_router.put("/user/profile", response_model=UserResponse)
async def update_user_profile(
    profile_update: UserProfileUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user profile (name, bio, picture)"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Update user profile
    update_data = profile_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"id": user["id"]})
    return UserResponse(**updated_user)


@api_router.post("/user/favorites/{post_id}")
async def toggle_favorite(
    post_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Add or remove post from user's favorites"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Check if post exists
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Toggle favorite
    favorite_posts = user.get("favorite_posts", [])
    is_favorited = post_id in favorite_posts
    
    if is_favorited:
        # Remove from favorites
        await db.users.update_one(
            {"id": user["id"]},
            {"$pull": {"favorite_posts": post_id}}
        )
        
        # Log activity
        activity = ActivityItem(
            user_id=user["id"],
            action="unfavorite",
            post_id=post_id
        )
        activity_dict = activity.dict()
        activity_dict["created_at"] = activity.created_at.isoformat()
        await db.activities.insert_one(activity_dict)
        
        return {"success": True, "favorited": False, "message": "Removed from favorites"}
    else:
        # Add to favorites
        await db.users.update_one(
            {"id": user["id"]},
            {"$addToSet": {"favorite_posts": post_id}}
        )
        
        # Log activity
        activity = ActivityItem(
            user_id=user["id"],
            action="favorite",
            post_id=post_id
        )
        activity_dict = activity.dict()
        activity_dict["created_at"] = activity.created_at.isoformat()
        await db.activities.insert_one(activity_dict)
        
        return {"success": True, "favorited": True, "message": "Added to favorites"}


@api_router.get("/user/favorites", response_model=List[Post])
async def get_user_favorites(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get all user's favorite posts"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    favorite_post_ids = user.get("favorite_posts", [])
    
    if not favorite_post_ids:
        return []
    
    # Get all favorite posts
    posts = await db.posts.find({"id": {"$in": favorite_post_ids}}).sort("createdAt", -1).to_list(1000)
    
    return [Post(**post) for post in posts]


@api_router.put("/user/preferences")
async def update_user_preferences(
    preferences: UserPreferences,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user's favorite platforms"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Update preferences
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "favorite_platforms": preferences.favorite_platforms,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Preferences updated"}


@api_router.get("/user/activity")
async def get_user_activity(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = Query(50, description="Number of activities to return")
):
    """Get user's activity history"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Get activities
    activities = await db.activities.find({"user_id": user["id"]}).sort("created_at", -1).limit(limit).to_list(limit)
    
    return activities


# ============ Custom Feeds Endpoints ============

@api_router.post("/user/feeds")
async def create_custom_feed(
    feed: CustomFeedCreate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Create a custom feed with saved filters"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Create feed
    custom_feed = CustomFeed(
        user_id=user["id"],
        name=feed.name,
        platforms=feed.platforms,
        categories=feed.categories,
        time_range=feed.time_range,
        sort_by=feed.sort_by
    )
    
    feed_dict = custom_feed.dict()
    feed_dict["created_at"] = custom_feed.created_at.isoformat()
    
    await db.custom_feeds.insert_one(feed_dict)
    
    return {"success": True, "feed_id": custom_feed.id, "message": "Custom feed created"}


@api_router.get("/user/feeds")
async def get_custom_feeds(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's custom feeds"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    feeds = await db.custom_feeds.find({"user_id": user["id"]}).sort("created_at", -1).to_list(100)
    
    return feeds


@api_router.delete("/user/feeds/{feed_id}")
async def delete_custom_feed(
    feed_id: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Delete a custom feed"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Delete feed (only if it belongs to user)
    result = await db.custom_feeds.delete_one({"id": feed_id, "user_id": user["id"]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Feed not found")
    
    return {"success": True, "message": "Feed deleted"}


# ============ AI Recommendations Endpoints ============

@api_router.get("/recommendations")
async def get_personalized_recommendations(
    request: Request,
    session_token: Optional[str] = Cookie(None),
    limit: int = Query(20, description="Number of recommendations")
):
    """Get AI-powered personalized recommendations for the user"""
    # Check if user is authenticated
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    user = None
    if token:
        user = await get_current_user_from_token(token)
    
    try:
        # Get available posts (exclude already seen if user is logged in)
        query = {}
        if user and user.get("favorite_posts"):
            query["id"] = {"$nin": user["favorite_posts"]}
        
        available_posts = await db.posts.find(query).sort("createdAt", -1).limit(100).to_list(100)
        
        if user:
            # AI-powered recommendations for logged-in users
            user_profile = {
                "user_id": user["id"],
                "favorite_platforms": user.get("favorite_platforms", []),
                "favorite_posts": user.get("favorite_posts", []),
                "recent_likes": [],  # Would get from activities collection
                "preferred_categories": []  # Would analyze from saved posts
            }
            
            # Get AI recommendations
            recommended_ids = await recommendation_engine.get_recommendations(
                user_profile,
                [p for p in available_posts],
                limit=limit
            )
            
            # If AI returns recommendations, use them; otherwise fallback
            if recommended_ids:
                # Get posts in recommended order
                id_to_post = {p["id"]: p for p in available_posts}
                recommended_posts = [id_to_post[pid] for pid in recommended_ids if pid in id_to_post]
                return [Post(**post) for post in recommended_posts]
        
        # Fallback: Trending algorithm for non-logged-in users or if AI fails
        # Sort by engagement score (likes + comments * 2 + shares * 3)
        for post in available_posts:
            post["engagement_score"] = post["likes"] + (post["comments"] * 2) + (post["shares"] * 3)
        
        available_posts.sort(key=lambda x: x["engagement_score"], reverse=True)
        
        return [Post(**post) for post in available_posts[:limit]]
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        # Fallback to recent viral posts
        posts = await db.posts.find({"category": "viral"}).sort("likes", -1).limit(limit).to_list(limit)
        return [Post(**post) for post in posts]


@api_router.get("/trending/topics")
async def get_trending_topics(limit: int = Query(5, description="Number of topics")):
    """Get AI-detected trending topics from recent posts"""
    try:
        # Get recent high-engagement posts
        posts = await db.posts.find().sort("createdAt", -1).limit(50).to_list(50)
        
        if not posts:
            return []
        
        # Use AI to detect trends
        topics = await recommendation_engine.detect_trending_topics([p for p in posts])
        
        return topics[:limit]
        
    except Exception as e:
        logger.error(f"Error detecting trending topics: {e}")
        return []


# ============ Analytics Endpoints ============

@api_router.get("/analytics/overview")
async def get_analytics_overview():
    """Get overall platform analytics"""
    try:
        total_posts = await db.posts.count_documents({})
        
        # Get platform breakdown
        platform_pipeline = [
            {"$group": {"_id": "$platform", "count": {"$sum": 1}}}
        ]
        platform_stats = await db.posts.aggregate(platform_pipeline).to_list(None)
        
        # Get category breakdown
        category_pipeline = [
            {"$group": {"_id": "$category", "count": {"$sum": 1}}}
        ]
        category_stats = await db.posts.aggregate(category_pipeline).to_list(None)
        
        # Get total engagement
        total_likes = await db.posts.aggregate([
            {"$group": {"_id": None, "total": {"$sum": "$likes"}}}
        ]).to_list(1)
        
        total_comments = await db.posts.aggregate([
            {"$group": {"_id": None, "total": {"$sum": "$comments"}}}
        ]).to_list(1)
        
        total_shares = await db.posts.aggregate([
            {"$group": {"_id": None, "total": {"$sum": "$shares"}}}
        ]).to_list(1)
        
        # Get video count
        video_count = await db.posts.count_documents({"media.type": "video"})
        
        return {
            "total_posts": total_posts,
            "total_videos": video_count,
            "total_images": total_posts - video_count,
            "total_likes": total_likes[0]["total"] if total_likes else 0,
            "total_comments": total_comments[0]["total"] if total_comments else 0,
            "total_shares": total_shares[0]["total"] if total_shares else 0,
            "platforms": {stat["_id"]: stat["count"] for stat in platform_stats},
            "categories": {stat["_id"]: stat["count"] for stat in category_stats}
        }
    except Exception as e:
        logger.error(f"Error getting analytics overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/analytics/platforms")
async def get_platform_analytics():
    """Get detailed platform performance metrics"""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": "$platform",
                    "post_count": {"$sum": 1},
                    "total_likes": {"$sum": "$likes"},
                    "total_comments": {"$sum": "$comments"},
                    "total_shares": {"$sum": "$shares"},
                    "avg_likes": {"$avg": "$likes"},
                    "avg_comments": {"$avg": "$comments"},
                    "video_count": {
                        "$sum": {"$cond": [{"$eq": ["$media.type", "video"]}, 1, 0]}
                    }
                }
            },
            {"$sort": {"total_likes": -1}}
        ]
        
        stats = await db.posts.aggregate(pipeline).to_list(None)
        
        return [
            {
                "platform": stat["_id"],
                "posts": stat["post_count"],
                "videos": stat["video_count"],
                "likes": stat["total_likes"],
                "comments": stat["total_comments"],
                "shares": stat["total_shares"],
                "avg_likes": round(stat["avg_likes"], 2),
                "avg_comments": round(stat["avg_comments"], 2)
            }
            for stat in stats
        ]
    except Exception as e:
        logger.error(f"Error getting platform analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/analytics/export")
async def export_analytics(format: str = Query("json", description="Export format: json or csv")):
    """Export analytics data"""
    try:
        overview = await get_analytics_overview()
        platforms = await get_platform_analytics()
        
        data = {
            "overview": overview,
            "platforms": platforms,
            "exported_at": datetime.now(timezone.utc).isoformat()
        }
        
        if format == "csv":
            # Simple CSV export of platform stats
            import io
            import csv
            
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=["platform", "posts", "videos", "likes", "comments", "shares"])
            writer.writeheader()
            writer.writerows(platforms)
            
            from fastapi.responses import StreamingResponse
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=chyllapp_analytics.csv"}
            )
        else:
            return data
            
    except Exception as e:
        logger.error(f"Error exporting analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Notification Endpoints ============

@api_router.get("/notifications/preferences")
async def get_notification_preferences(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get user's notification preferences"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Get preferences or create default
    prefs = await db.notification_preferences.find_one({"user_id": user["id"]})
    
    if not prefs:
        # Create default preferences
        default_prefs = NotificationPreferences(user_id=user["id"])
        prefs_dict = default_prefs.dict()
        prefs_dict["created_at"] = default_prefs.created_at.isoformat()
        prefs_dict["updated_at"] = default_prefs.updated_at.isoformat()
        
        await db.notification_preferences.insert_one(prefs_dict)
        return default_prefs.dict()
    
    return prefs


@api_router.put("/notifications/preferences")
async def update_notification_preferences(
    preferences: NotificationPreferencesUpdate,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Update user's notification preferences"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    # Update preferences
    update_data = preferences.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.notification_preferences.update_one(
        {"user_id": user["id"]},
        {"$set": update_data},
        upsert=True
    )
    
    return {"success": True, "message": "Notification preferences updated"}


# ============ Platform OAuth Endpoints ============

@api_router.get("/oauth/{platform}/login")
async def platform_oauth_login(
    platform: str,
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Initiate OAuth flow for a social media platform"""
    # Check if user is authenticated
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Must be logged in to connect platforms")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Platform-specific OAuth URLs
    base_url = os.getenv('REACT_APP_BACKEND_URL', 'https://contentchill.preview.emergentagent.com')
    redirect_uri = f"{base_url}/api/oauth/{platform}/callback"
    
    # Store user_id in state parameter for callback
    state = f"{user['id']}_{platform}"
    
    oauth_urls = {
        'tiktok': f"https://www.tiktok.com/v2/auth/authorize/?client_key={os.getenv('TIKTOK_CLIENT_ID')}&scope=user.info.basic,video.list&response_type=code&redirect_uri={redirect_uri}&state={state}",
        'facebook': f"https://www.facebook.com/v18.0/dialog/oauth?client_id={os.getenv('FACEBOOK_CLIENT_ID')}&redirect_uri={redirect_uri}&state={state}&scope=public_profile,email",
        'instagram': f"https://api.instagram.com/oauth/authorize?client_id={os.getenv('INSTAGRAM_CLIENT_ID')}&redirect_uri={redirect_uri}&scope=user_profile,user_media&response_type=code&state={state}",
    }
    
    if platform not in oauth_urls:
        raise HTTPException(status_code=400, detail=f"Platform {platform} OAuth not supported yet")
    
    return RedirectResponse(url=oauth_urls[platform])


@api_router.get("/oauth/{platform}/callback")
async def platform_oauth_callback(
    platform: str,
    code: str,
    state: str,
    response: Response
):
    """Handle OAuth callback from social media platform"""
    try:
        # Extract user_id from state
        user_id = state.split('_')[0]
        
        # Exchange code for access token (platform-specific)
        # For now, store the code (in production, exchange for actual token)
        
        # Store platform connection
        connection = PlatformConnection(
            user_id=user_id,
            platform=platform,
            access_token=code,  # In production, exchange code for actual token
            platform_user_id="",  # Would get from platform API
            platform_username=""  # Would get from platform API
        )
        
        conn_dict = connection.dict()
        conn_dict["connected_at"] = connection.connected_at.isoformat()
        
        await db.platform_connections.insert_one(conn_dict)
        
        logger.info(f"User {user_id} connected {platform}")
        
        # Redirect back to frontend with success message
        frontend_url = os.getenv('REACT_APP_BACKEND_URL', 'https://contentchill.preview.emergentagent.com')
        return RedirectResponse(url=f"{frontend_url}/?platform_connected={platform}")
        
    except Exception as e:
        logger.error(f"Error in {platform} OAuth callback: {e}")
        frontend_url = os.getenv('REACT_APP_BACKEND_URL', 'https://contentchill.preview.emergentagent.com')
        return RedirectResponse(url=f"{frontend_url}/?error=oauth_failed")


@api_router.get("/user/connected-platforms")
async def get_connected_platforms(
    request: Request,
    session_token: Optional[str] = Cookie(None)
):
    """Get list of platforms user has connected"""
    token = session_token or (request.headers.get("Authorization", "").replace("Bearer ", "") if request.headers.get("Authorization") else None)
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    connections = await db.platform_connections.find({"user_id": user["id"]}).to_list(100)
    
    return [
        {
            "platform": conn["platform"],
            "connected_at": conn["connected_at"],
            "platform_username": conn.get("platform_username", "")
        }
        for conn in connections
    ]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()