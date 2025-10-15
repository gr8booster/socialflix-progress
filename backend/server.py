from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from models import Post, PostCreate, LikeRequest, CommentRequest, ShareRequest, PlatformInfo
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
    platform: Optional[str] = Query(None, description="Filter by platform"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: Optional[int] = Query(None, description="Limit number of results")
):
    """Get all posts with optional filters"""
    query = {}
    if platform:
        query["platform"] = platform
    if category:
        query["category"] = category
    
    posts_cursor = db.posts.find(query).sort("createdAt", -1)
    
    if limit:
        posts_cursor = posts_cursor.limit(limit)
    
    posts = await posts_cursor.to_list(1000)
    return [Post(**post) for post in posts]


@api_router.get("/posts/featured", response_model=Post)
async def get_featured_post():
    """Get the featured post for hero section"""
    # Get the post with most likes from viral category
    post = await db.posts.find_one(
        {"category": "viral"},
        sort=[("likes", -1)]
    )
    
    if not post:
        # Fallback to any post with most likes
        post = await db.posts.find_one(sort=[("likes", -1)])
    
    if not post:
        raise HTTPException(status_code=404, detail="No posts found")
    
    return Post(**post)


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
        mock_posts = total_posts - reddit_posts - youtube_posts - twitter_posts - instagram_posts - tiktok_posts - facebook_posts - threads_posts - snapchat_posts
        
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
            "mock_posts": mock_posts,
            "scraper_ready": True
        }
    except Exception as e:
        logger.error(f"Error getting scraper status: {e}")
        return {
            "status": "error",
            "error": str(e)
        }


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