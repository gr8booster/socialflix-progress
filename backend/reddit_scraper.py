import requests
import logging
from typing import List, Dict, Optional
from datetime import datetime
import time

logger = logging.getLogger(__name__)

class RedditScraper:
    """Scraper for fetching viral content from Reddit using public JSON API"""
    
    BASE_URL = "https://www.reddit.com"
    
    # Popular subreddits for different types of content
    SUBREDDITS = {
        "general": ["popular", "all"],
        "videos": ["videos", "PublicFreakout", "Unexpected"],
        "images": ["pics", "interestingasfuck", "nextfuckinglevel"],
        "funny": ["funny", "memes", "dankmemes"],
        "wholesome": ["aww", "MadeMeSmile", "wholesome"],
        "technology": ["technology", "Futurology", "gadgets"]
    }
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'SocialFlix/1.0 (Viral Content Aggregator)'
        })
    
    def fetch_posts(self, subreddit: str = "popular", sort: str = "hot", limit: int = 25) -> List[Dict]:
        """
        Fetch posts from a subreddit
        
        Args:
            subreddit: Subreddit name (without r/)
            sort: Sort type (hot, new, top, rising)
            limit: Number of posts to fetch (max 100)
        
        Returns:
            List of post dictionaries
        """
        try:
            url = f"{self.BASE_URL}/r/{subreddit}/{sort}.json"
            params = {'limit': min(limit, 100)}
            
            logger.info(f"Fetching posts from r/{subreddit} ({sort})")
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            posts = []
            
            for child in data.get('data', {}).get('children', []):
                post_data = child.get('data', {})
                posts.append(self._transform_post(post_data))
            
            logger.info(f"Successfully fetched {len(posts)} posts from r/{subreddit}")
            return posts
            
        except requests.RequestException as e:
            logger.error(f"Error fetching posts from r/{subreddit}: {e}")
            return []
    
    def fetch_multiple_subreddits(self, subreddit_list: List[str], limit_per_sub: int = 10) -> List[Dict]:
        """
        Fetch posts from multiple subreddits
        
        Args:
            subreddit_list: List of subreddit names
            limit_per_sub: Number of posts to fetch per subreddit
        
        Returns:
            Combined list of posts from all subreddits
        """
        all_posts = []
        
        for subreddit in subreddit_list:
            posts = self.fetch_posts(subreddit, sort="hot", limit=limit_per_sub)
            all_posts.extend(posts)
            
            # Be nice to Reddit's servers
            time.sleep(1)
        
        return all_posts
    
    def fetch_viral_content(self, limit: int = 50) -> List[Dict]:
        """
        Fetch viral content from multiple popular subreddits
        
        Args:
            limit: Total number of posts to fetch
        
        Returns:
            List of viral posts
        """
        # Fetch from r/popular which aggregates trending content
        return self.fetch_posts("popular", sort="hot", limit=limit)
    
    def _transform_post(self, reddit_post: Dict) -> Dict:
        """
        Transform Reddit post data to our Post model format
        
        Args:
            reddit_post: Raw Reddit post data
        
        Returns:
            Transformed post dictionary
        """
        # Determine media type and URL
        media_type = "text"
        media_url = None
        thumbnail_url = None
        
        # Check for images
        if reddit_post.get('post_hint') == 'image':
            media_type = "image"
            media_url = reddit_post.get('url')
        
        # Check for videos
        elif reddit_post.get('is_video'):
            media_type = "video"
            # Reddit video URL
            if 'media' in reddit_post and reddit_post['media']:
                media_url = reddit_post['media'].get('reddit_video', {}).get('fallback_url')
            thumbnail_url = reddit_post.get('thumbnail')
        
        # Check for external videos (YouTube, etc.)
        elif reddit_post.get('domain') in ['youtube.com', 'youtu.be', 'v.redd.it']:
            media_type = "video"
            media_url = reddit_post.get('url')
            thumbnail_url = reddit_post.get('thumbnail')
        
        # Fallback to preview images
        elif 'preview' in reddit_post and reddit_post['preview']:
            media_type = "image"
            images = reddit_post['preview'].get('images', [])
            if images:
                media_url = images[0].get('source', {}).get('url', '').replace('&amp;', '&')
        
        # Use thumbnail as fallback
        if not media_url and reddit_post.get('thumbnail') and reddit_post['thumbnail'].startswith('http'):
            media_type = "image"
            media_url = reddit_post['thumbnail']
        
        # Default placeholder if no media
        if not media_url:
            media_url = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop"
        
        # Calculate time ago
        created_utc = reddit_post.get('created_utc', time.time())
        time_diff = time.time() - created_utc
        time_ago = self._format_time_ago(time_diff)
        
        # Determine category based on score and subreddit
        category = self._determine_category(reddit_post)
        
        return {
            "platform": "reddit",
            "platformColor": "#FF4500",
            "user": {
                "name": reddit_post.get('subreddit_name_prefixed', 'r/unknown'),
                "username": f"u/{reddit_post.get('author', 'unknown')}",
                "avatar": reddit_post.get('thumbnail', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop')
            },
            "content": reddit_post.get('title', 'Untitled post'),
            "media": {
                "type": media_type,
                "url": media_url,
                "thumbnail": thumbnail_url or media_url
            },
            "likes": reddit_post.get('ups', 0),
            "comments": reddit_post.get('num_comments', 0),
            "shares": reddit_post.get('num_crossposts', 0),
            "timestamp": time_ago,
            "category": category,
            "reddit_url": f"https://reddit.com{reddit_post.get('permalink', '')}",
            "reddit_id": reddit_post.get('id')
        }
    
    def _format_time_ago(self, seconds: float) -> str:
        """Format seconds into human-readable time ago string"""
        if seconds < 3600:
            minutes = int(seconds / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = int(seconds / 86400)
            return f"{days} day{'s' if days != 1 else ''} ago"
    
    def _determine_category(self, reddit_post: Dict) -> str:
        """Determine post category based on engagement"""
        score = reddit_post.get('ups', 0)
        
        if score > 50000:
            return "viral"
        elif score > 20000:
            return "trending"
        else:
            return "most-liked"
