import requests
import logging
from typing import List, Dict
import os
import time

logger = logging.getLogger(__name__)

class ThreadsScraper:
    """Scraper for fetching trending posts from Threads (Meta)"""
    
    def __init__(self):
        self.client_id = os.getenv('THREADS_CLIENT_ID')
        self.client_secret = os.getenv('THREADS_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            logger.warning("Threads API credentials not found in environment variables")
    
    def fetch_trending_posts(self, max_results: int = 50) -> List[Dict]:
        """
        Fetch trending posts from Threads
        
        Note: Threads API requires user authentication.
        This generates sample trending Threads content.
        
        Args:
            max_results: Number of posts to fetch
        
        Returns:
            List of post dictionaries
        """
        logger.info("Threads API requires user authentication")
        logger.info("Generating simulated trending Threads posts...")
        
        posts = self._generate_sample_posts(max_results)
        
        logger.info(f"Generated {len(posts)} sample Threads posts")
        return posts
    
    def _generate_sample_posts(self, count: int) -> List[Dict]:
        """Generate sample Threads posts with realistic data"""
        
        sample_posts = [
            {
                "user": {"name": "Mark Zuckerberg", "username": "@zuck", 
                         "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"},
                "content": "Excited to announce new features coming to Threads! The future of social media is conversational 💬",
                "media_url": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop",
                "likes": 2100000, "comments": 45000, "shares": 89000, "timestamp": "2 hours ago"
            },
            {
                "user": {"name": "OpenAI", "username": "@openai", 
                         "avatar": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop"},
                "content": "ChatGPT just got a major upgrade. Here's what's new and how it will change everything 🤖✨",
                "media_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
                "likes": 3400000, "comments": 78000, "shares": 156000, "timestamp": "4 hours ago"
            },
            {
                "user": {"name": "Bill Gates", "username": "@billgates", 
                         "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"},
                "content": "Reading this incredible book on climate solutions. Every leader should read it. Link in comments 📚🌍",
                "media_url": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=600&fit=crop",
                "likes": 1890000, "comments": 34000, "shares": 67000, "timestamp": "6 hours ago"
            },
            {
                "user": {"name": "Elon Musk", "username": "@elonmusk", 
                         "avatar": "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop"},
                "content": "SpaceX Starship test flight went better than expected. Mars, here we come! 🚀🔴",
                "media_url": "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=600&fit=crop",
                "likes": 4500000, "comments": 123000, "shares": 234000, "timestamp": "8 hours ago"
            },
            {
                "user": {"name": "Netflix", "username": "@netflix", 
                         "avatar": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&h=100&fit=crop"},
                "content": "New season dropping this Friday. You're not ready for this plot twist 📺🔥",
                "media_url": "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=600&fit=crop",
                "likes": 2700000, "comments": 89000, "shares": 145000, "timestamp": "10 hours ago"
            },
            {
                "user": {"name": "Tim Cook", "username": "@tim_cook", 
                         "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"},
                "content": "Innovation is in our DNA. Excited to share what we've been working on... Stay tuned 🍎",
                "media_url": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=600&fit=crop",
                "likes": 1950000, "comments": 56000, "shares": 78000, "timestamp": "12 hours ago"
            },
            {
                "user": {"name": "Greta Thunberg", "username": "@gretathunberg", 
                         "avatar": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop"},
                "content": "The climate crisis is NOW. We can't wait any longer. Here's what YOU can do today 🌍💚",
                "media_url": "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=600&fit=crop",
                "likes": 3100000, "comments": 98000, "shares": 189000, "timestamp": "14 hours ago"
            },
            {
                "user": {"name": "Dwayne Johnson", "username": "@therock", 
                         "avatar": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop"},
                "content": "Blood, sweat, and respect. That's the price of success. Keep grinding 💪🔥",
                "media_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop",
                "likes": 5200000, "comments": 145000, "shares": 267000, "timestamp": "16 hours ago"
            },
            {
                "user": {"name": "Taylor Swift", "username": "@taylorswift", 
                         "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"},
                "content": "New album announcement! Can't wait to share these songs with you all 🎵✨",
                "media_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
                "likes": 6800000, "comments": 234000, "shares": 456000, "timestamp": "18 hours ago"
            },
            {
                "user": {"name": "NASA", "username": "@nasa", 
                         "avatar": "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=100&h=100&fit=crop"},
                "content": "We just discovered something incredible on Europa. This changes everything we know about life in our solar system 🪐🔬",
                "media_url": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop",
                "likes": 4100000, "comments": 167000, "shares": 298000, "timestamp": "20 hours ago"
            },
            {
                "user": {"name": "Barack Obama", "username": "@barackobama", 
                         "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"},
                "content": "Hope is not a strategy, but it's a start. Here's what we can do to build a better future together 🇺🇸",
                "media_url": "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&h=600&fit=crop",
                "likes": 3900000, "comments": 112000, "shares": 234000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Serena Williams", "username": "@serenawilliams", 
                         "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"},
                "content": "Champions are made in the gym. Here's my morning workout routine 🎾💪",
                "media_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
                "likes": 2400000, "comments": 67000, "shares": 89000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Gordon Ramsay", "username": "@gordonramsay", 
                         "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop"},
                "content": "Cooking tip: NEVER use a blunt knife. It's dangerous and ruins the food. Here's how to sharpen properly 🔪👨‍🍳",
                "media_url": "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop",
                "likes": 1780000, "comments": 45000, "shares": 67000, "timestamp": "2 days ago"
            },
            {
                "user": {"name": "Ariana Grande", "username": "@arianagrande", 
                         "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop"},
                "content": "Thank you for all the love on the new single! This means everything to me 💕🎤",
                "media_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
                "likes": 5600000, "comments": 189000, "shares": 234000, "timestamp": "2 days ago"
            },
            {
                "user": {"name": "Malala Yousafzai", "username": "@malala", 
                         "avatar": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop"},
                "content": "Education is the key to unlocking every door. Proud to announce our new initiative for girls worldwide 📚✨",
                "media_url": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
                "likes": 2900000, "comments": 78000, "shares": 156000, "timestamp": "3 days ago"
            }
        ]
        
        # Transform to our format
        posts = []
        for i, sample in enumerate(sample_posts[:count]):
            post = self._transform_post(sample, f"threads_sample_{i}")
            if post:
                posts.append(post)
        
        return posts
    
    def _transform_post(self, threads_post: Dict, post_id: str) -> Dict:
        """Transform Threads post data to our Post model format"""
        try:
            user = threads_post.get('user', {})
            
            # Determine category based on likes
            likes = threads_post.get('likes', 0)
            category = self._determine_category(likes)
            
            return {
                "platform": "threads",
                "platformColor": "#000000",
                "user": {
                    "name": user.get('name', 'Unknown User'),
                    "username": user.get('username', '@unknown'),
                    "avatar": user.get('avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop')
                },
                "content": threads_post.get('content', 'No content'),
                "media": {
                    "type": "image",
                    "url": threads_post.get('media_url', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop'),
                    "thumbnail": threads_post.get('media_url', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop')
                },
                "likes": likes,
                "comments": threads_post.get('comments', 0),
                "shares": threads_post.get('shares', 0),
                "timestamp": threads_post.get('timestamp', 'recently'),
                "category": category,
                "threads_id": post_id
            }
            
        except Exception as e:
            logger.error(f"Error transforming Threads post: {e}")
            return None
    
    def _determine_category(self, like_count: int) -> str:
        """Determine post category based on like count"""
        if like_count > 4000000:  # 4M+ likes
            return "viral"
        elif like_count > 2000000:  # 2M+ likes
            return "trending"
        else:
            return "most-liked"
