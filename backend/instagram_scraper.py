import requests
import logging
from typing import List, Dict
import os
import time

logger = logging.getLogger(__name__)

class InstagramScraper:
    """Scraper for fetching trending posts from Instagram using Instagram Graph API"""
    
    BASE_URL = "https://graph.instagram.com"
    GRAPH_URL = "https://graph.facebook.com/v18.0"
    
    def __init__(self):
        self.client_id = os.getenv('INSTAGRAM_CLIENT_ID')
        self.client_secret = os.getenv('INSTAGRAM_CLIENT_SECRET')
        self.access_token = None
        
        if not self.client_id or not self.client_secret:
            logger.warning("Instagram API credentials not found in environment variables")
    
    def fetch_trending_posts(self, max_results: int = 50) -> List[Dict]:
        """
        Fetch trending posts from Instagram
        
        Note: Instagram Graph API requires user access tokens and only returns data for
        Instagram Business/Creator accounts that have been authenticated. This is a 
        simulated version that would work with proper OAuth flow.
        
        Args:
            max_results: Number of posts to fetch
        
        Returns:
            List of post dictionaries
        """
        # Instagram API requires OAuth flow and user-specific access tokens
        # For now, we'll create sample data based on trending hashtags
        logger.info("Instagram API requires user authentication with OAuth flow")
        logger.info("Generating simulated trending Instagram posts...")
        
        posts = self._generate_sample_posts(max_results)
        
        logger.info(f"Generated {len(posts)} sample Instagram posts")
        return posts
    
    def _generate_sample_posts(self, count: int) -> List[Dict]:
        """Generate sample Instagram posts with realistic data"""
        
        sample_posts = [
            {
                "user": {"name": "National Geographic", "username": "@natgeo", 
                         "avatar": "https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=100&h=100&fit=crop"},
                "content": "Breathtaking sunset over the Grand Canyon 🌅 Photo by @chrisburkard",
                "media_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
                "likes": 2850000, "comments": 18900, "timestamp": "2 hours ago"
            },
            {
                "user": {"name": "Nike", "username": "@nike", 
                         "avatar": "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=100&h=100&fit=crop"},
                "content": "Just Do It. New Air Max collection dropping tomorrow 👟",
                "media_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
                "likes": 1950000, "comments": 12400, "timestamp": "4 hours ago"
            },
            {
                "user": {"name": "Cristiano Ronaldo", "username": "@cristiano", 
                         "avatar": "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"},
                "content": "Training hard for the next match 💪⚽ #CR7",
                "media_url": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=800&fit=crop",
                "likes": 5200000, "comments": 45000, "timestamp": "6 hours ago"
            },
            {
                "user": {"name": "NASA", "username": "@nasa", 
                         "avatar": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=100&h=100&fit=crop"},
                "content": "New image from James Webb Space Telescope shows distant galaxies 🌌✨",
                "media_url": "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=800&fit=crop",
                "likes": 3100000, "comments": 28000, "timestamp": "8 hours ago"
            },
            {
                "user": {"name": "Selena Gomez", "username": "@selenagomez", 
                         "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"},
                "content": "Behind the scenes from today's photoshoot 📸💫",
                "media_url": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=800&fit=crop",
                "likes": 4800000, "comments": 38000, "timestamp": "10 hours ago"
            },
            {
                "user": {"name": "The Rock", "username": "@therock", 
                         "avatar": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop"},
                "content": "It's about drive, it's about power 💪🔥 #TeamRock",
                "media_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=800&fit=crop",
                "likes": 6100000, "comments": 52000, "timestamp": "12 hours ago"
            },
            {
                "user": {"name": "Instagram", "username": "@instagram", 
                         "avatar": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop"},
                "content": "Introducing new Reels features! Create, share, and discover 🎬",
                "media_url": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&h=800&fit=crop",
                "likes": 2200000, "comments": 15000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Vogue", "username": "@voguemagazine", 
                         "avatar": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop"},
                "content": "Fashion Week highlights from Paris 👗✨ Link in bio",
                "media_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=800&fit=crop",
                "likes": 1750000, "comments": 9800, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Gordon Ramsay", "username": "@gordongram", 
                         "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"},
                "content": "Perfect Wellington! This is how it's done 👨‍🍳🔥",
                "media_url": "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=800&h=800&fit=crop",
                "likes": 2900000, "comments": 19000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Kylie Jenner", "username": "@kyliejenner", 
                         "avatar": "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100&h=100&fit=crop"},
                "content": "New Kylie Cosmetics collection dropping soon 💄💋",
                "media_url": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=800&fit=crop",
                "likes": 7200000, "comments": 65000, "timestamp": "2 days ago"
            },
            {
                "user": {"name": "Travel + Leisure", "username": "@travelandleisure", 
                         "avatar": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop"},
                "content": "10 hidden gems in Bali you need to visit 🌴✈️",
                "media_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=800&fit=crop",
                "likes": 1420000, "comments": 7800, "timestamp": "2 days ago"
            },
            {
                "user": {"name": "Apple", "username": "@apple", 
                         "avatar": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&h=100&fit=crop"},
                "content": "Shot on iPhone. Share your best photos with #ShotOniPhone 📱",
                "media_url": "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&h=800&fit=crop",
                "likes": 3400000, "comments": 21000, "timestamp": "2 days ago"
            },
            {
                "user": {"name": "Zendaya", "username": "@zendaya", 
                         "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop"},
                "content": "Red carpet vibes ✨💃 Thank you for the love!",
                "media_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=800&fit=crop",
                "likes": 5600000, "comments": 42000, "timestamp": "3 days ago"
            },
            {
                "user": {"name": "Food Network", "username": "@foodnetwork", 
                         "avatar": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100&h=100&fit=crop"},
                "content": "The ultimate chocolate cake recipe 🍫🎂 Recipe in bio!",
                "media_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=800&fit=crop",
                "likes": 1890000, "comments": 11000, "timestamp": "3 days ago"
            },
            {
                "user": {"name": "Tesla", "username": "@tesla", 
                         "avatar": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=100&h=100&fit=crop"},
                "content": "Cybertruck production update. Coming soon 🚗⚡",
                "media_url": "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=800&fit=crop",
                "likes": 2650000, "comments": 16500, "timestamp": "3 days ago"
            }
        ]
        
        # Transform to our format
        posts = []
        for i, sample in enumerate(sample_posts[:count]):
            post = self._transform_post(sample, f"ig_sample_{i}")
            if post:
                posts.append(post)
        
        return posts
    
    def _transform_post(self, instagram_post: Dict, post_id: str) -> Dict:
        """Transform Instagram post data to our Post model format"""
        try:
            user = instagram_post.get('user', {})
            
            # Determine category based on likes
            likes = instagram_post.get('likes', 0)
            category = self._determine_category(likes)
            
            return {
                "platform": "instagram",
                "platformColor": "#E1306C",
                "user": {
                    "name": user.get('name', 'Unknown User'),
                    "username": user.get('username', '@unknown'),
                    "avatar": user.get('avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop')
                },
                "content": instagram_post.get('content', 'No caption'),
                "media": {
                    "type": "image",
                    "url": instagram_post.get('media_url', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop'),
                    "thumbnail": instagram_post.get('media_url', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=800&fit=crop')
                },
                "likes": likes,
                "comments": instagram_post.get('comments', 0),
                "shares": 0,  # Instagram doesn't provide share count via API
                "timestamp": instagram_post.get('timestamp', 'recently'),
                "category": category,
                "instagram_id": post_id
            }
            
        except Exception as e:
            logger.error(f"Error transforming Instagram post: {e}")
            return None
    
    def _determine_category(self, like_count: int) -> str:
        """Determine post category based on like count"""
        if like_count > 5000000:  # 5M+ likes
            return "viral"
        elif like_count > 1000000:  # 1M+ likes
            return "trending"
        else:
            return "most-liked"
