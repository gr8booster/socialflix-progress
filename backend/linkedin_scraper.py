import requests
import logging
from typing import List, Dict
import os
import time

logger = logging.getLogger(__name__)

class LinkedInScraper:
    """Scraper for fetching trending posts from LinkedIn"""
    
    def __init__(self):
        self.client_id = os.getenv('LINKEDIN_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            logger.warning("LinkedIn API credentials not found in environment variables")
    
    def fetch_trending_posts(self, max_results: int = 50) -> List[Dict]:
        """
        Fetch trending posts from LinkedIn
        
        Note: LinkedIn API requires OAuth authentication.
        This generates sample trending LinkedIn content.
        
        Args:
            max_results: Number of posts to fetch
        
        Returns:
            List of post dictionaries
        """
        logger.info("LinkedIn API requires OAuth authentication")
        logger.info("Generating simulated trending LinkedIn posts...")
        
        posts = self._generate_sample_posts(max_results)
        
        logger.info(f"Generated {len(posts)} sample LinkedIn posts")
        return posts
    
    def _generate_sample_posts(self, count: int) -> List[Dict]:
        """Generate sample LinkedIn posts with realistic data"""
        
        sample_posts = [
            {
                "user": {"name": "Bill Gates", "username": "Bill Gates", 
                         "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"},
                "content": "The future of clean energy is here. Excited to share our latest breakthrough in renewable technology. Read more in my blog post.",
                "media_url": "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop",
                "likes": 456000, "comments": 12000, "shares": 34000, "timestamp": "2 hours ago"
            },
            {
                "user": {"name": "Satya Nadella", "username": "Satya Nadella", 
                         "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"},
                "content": "AI is transforming every industry. At Microsoft, we're committed to responsible AI that empowers everyone. Here's what we're building...",
                "media_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
                "likes": 389000, "comments": 9800, "shares": 28000, "timestamp": "4 hours ago"
            },
            {
                "user": {"name": "Simon Sinek", "username": "Simon Sinek", 
                         "avatar": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop"},
                "content": "Great leaders don't set out to be leaders. They set out to make a difference. Here's what I learned from 20 years of studying leadership...",
                "media_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
                "likes": 567000, "comments": 15000, "shares": 45000, "timestamp": "6 hours ago"
            },
            {
                "user": {"name": "Sheryl Sandberg", "username": "Sheryl Sandberg", 
                         "avatar": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop"},
                "content": "Women in leadership drive better business outcomes. Here's the data that proves it and what companies can do to close the gap.",
                "media_url": "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop",
                "likes": 423000, "comments": 11000, "shares": 39000, "timestamp": "8 hours ago"
            },
            {
                "user": {"name": "Gary Vaynerchuk", "username": "Gary Vaynerchuk", 
                         "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"},
                "content": "Stop waiting for the 'perfect moment.' The perfect moment is NOW. Here's how I built my empire and what you can learn from it.",
                "media_url": "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop",
                "likes": 512000, "comments": 14000, "shares": 42000, "timestamp": "10 hours ago"
            },
            {
                "user": {"name": "Arianna Huffington", "username": "Arianna Huffington", 
                         "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"},
                "content": "Burnout is not a badge of honor. Here's why prioritizing well-being is the key to sustainable success in business and life.",
                "media_url": "https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=800&h=600&fit=crop",
                "likes": 378000, "comments": 8900, "shares": 31000, "timestamp": "12 hours ago"
            },
            {
                "user": {"name": "Reid Hoffman", "username": "Reid Hoffman", 
                         "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"},
                "content": "The future of work is here. Remote teams, AI collaboration, and new paradigms are reshaping how we build companies. My thoughts on what's next...",
                "media_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop",
                "likes": 345000, "comments": 7800, "shares": 26000, "timestamp": "14 hours ago"
            },
            {
                "user": {"name": "Melinda Gates", "username": "Melinda French Gates", 
                         "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"},
                "content": "Investing in women and girls isn't just the right thing to do—it's the smart thing to do. Here's how we can accelerate progress towards equality.",
                "media_url": "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop",
                "likes": 401000, "comments": 10000, "shares": 35000, "timestamp": "16 hours ago"
            },
            {
                "user": {"name": "Sundar Pichai", "username": "Sundar Pichai", 
                         "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"},
                "content": "AI will be more transformative than electricity or fire. At Google, we're working to make sure this powerful technology benefits everyone.",
                "media_url": "https://images.unsplash.com/photo-1488229297570-58520851e868?w=800&h=600&fit=crop",
                "likes": 489000, "comments": 13000, "shares": 41000, "timestamp": "18 hours ago"
            },
            {
                "user": {"name": "Brené Brown", "username": "Brené Brown", 
                         "avatar": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop"},
                "content": "Vulnerability is not weakness. It's the birthplace of innovation, creativity and change. Here's what 20 years of research taught me about courage...",
                "media_url": "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=600&fit=crop",
                "likes": 534000, "comments": 14500, "shares": 47000, "timestamp": "20 hours ago"
            },
            {
                "user": {"name": "Adam Grant", "username": "Adam Grant", 
                         "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"},
                "content": "Rethinking is a skill you can develop. Here's how the best leaders and teams challenge their own assumptions to drive innovation.",
                "media_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
                "likes": 412000, "comments": 11000, "shares": 36000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Indra Nooyi", "username": "Indra Nooyi", 
                         "avatar": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop"},
                "content": "Leadership lessons from 12 years as PepsiCo CEO: It's not just about making tough decisions—it's about making the right ones for all stakeholders.",
                "media_url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
                "likes": 367000, "comments": 8900, "shares": 29000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Daniel Pink", "username": "Daniel Pink", 
                         "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"},
                "content": "The science of motivation: Why carrots and sticks don't work anymore. Here's what actually drives people to do their best work.",
                "media_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
                "likes": 328000, "comments": 7600, "shares": 25000, "timestamp": "2 days ago"
            },
            {
                "user": {"name": "Mary Barra", "username": "Mary Barra", 
                         "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"},
                "content": "The future of mobility is electric. Here's how GM is leading the transition and what it means for jobs, communities, and the planet.",
                "media_url": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop",
                "likes": 356000, "comments": 9200, "shares": 31000, "timestamp": "2 days ago"
            },
            {
                "user": {"name": "Tim Ferriss", "username": "Tim Ferriss", 
                         "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"},
                "content": "The most successful people I've interviewed all share this one habit. It's not what you think. Here's what they do differently...",
                "media_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=600&fit=crop",
                "likes": 445000, "comments": 12000, "shares": 38000, "timestamp": "3 days ago"
            }
        ]
        
        # Transform to our format
        posts = []
        for i, sample in enumerate(sample_posts[:count]):
            post = self._transform_post(sample, f"linkedin_sample_{i}")
            if post:
                posts.append(post)
        
        return posts
    
    def _transform_post(self, linkedin_post: Dict, post_id: str) -> Dict:
        """Transform LinkedIn post data to our Post model format"""
        try:
            user = linkedin_post.get('user', {})
            
            # Determine category based on engagement
            likes = linkedin_post.get('likes', 0)
            category = self._determine_category(likes)
            
            return {
                "platform": "linkedin",
                "platformColor": "#0A66C2",
                "user": {
                    "name": user.get('name', 'Unknown User'),
                    "username": user.get('username', 'Unknown'),
                    "avatar": user.get('avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop')
                },
                "content": linkedin_post.get('content', 'No content'),
                "media": {
                    "type": "image",
                    "url": linkedin_post.get('media_url', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop'),
                    "thumbnail": linkedin_post.get('media_url', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop')
                },
                "likes": likes,
                "comments": linkedin_post.get('comments', 0),
                "shares": linkedin_post.get('shares', 0),
                "timestamp": linkedin_post.get('timestamp', 'recently'),
                "category": category,
                "linkedin_id": post_id
            }
            
        except Exception as e:
            logger.error(f"Error transforming LinkedIn post: {e}")
            return None
    
    def _determine_category(self, like_count: int) -> str:
        """Determine post category based on engagement"""
        if like_count > 500000:  # 500K+ likes
            return "viral"
        elif like_count > 300000:  # 300K+ likes
            return "trending"
        else:
            return "most-liked"
