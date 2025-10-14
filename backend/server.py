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


# Startup event to seed database
@app.on_event("startup")
async def startup_db():
    await seed_database()


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Welcome to SocialFlix API"}


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
    return [PlatformInfo(**p) for p in platform_info]


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