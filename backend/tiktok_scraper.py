import requests
import logging
from typing import List, Dict
import os
import time

logger = logging.getLogger(__name__)

class TikTokScraper:
    """Scraper for fetching trending videos from TikTok"""
    
    def __init__(self):
        self.client_id = os.getenv('TIKTOK_CLIENT_ID')
        self.client_secret = os.getenv('TIKTOK_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            logger.warning("TikTok API credentials not found in environment variables")
    
    def fetch_trending_videos(self, max_results: int = 50) -> List[Dict]:
        """
        Fetch trending videos from TikTok
        
        Note: TikTok API requires user authentication and OAuth flow.
        This generates sample trending TikTok content.
        
        Args:
            max_results: Number of videos to fetch
        
        Returns:
            List of video dictionaries
        """
        logger.info("TikTok API requires user authentication with OAuth flow")
        logger.info("Generating simulated trending TikTok videos...")
        
        videos = self._generate_sample_videos(max_results)
        
        logger.info(f"Generated {len(videos)} sample TikTok videos")
        return videos
    
    def _generate_sample_videos(self, count: int) -> List[Dict]:
        """Generate sample TikTok videos with realistic data"""
        
        sample_videos = [
            {
                "user": {"name": "Charli D'Amelio", "username": "@charlidamelio", 
                         "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"},
                "content": "New dance challenge! Who's trying this? 💃 #DanceChallenge #Viral",
                "media_url": "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&h=600&fit=crop",
                "likes": 8200000, "comments": 156000, "shares": 1200000, "timestamp": "2 hours ago"
            },
            {
                "user": {"name": "Bella Poarch", "username": "@bellapoarch", 
                         "avatar": "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100&h=100&fit=crop"},
                "content": "Build a B*tch 🎵 New music video out now! #BuildABitch",
                "media_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
                "likes": 9500000, "comments": 189000, "shares": 2100000, "timestamp": "4 hours ago"
            },
            {
                "user": {"name": "Khaby Lame", "username": "@khaby.lame", 
                         "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"},
                "content": "Life hack reactions be like... 🤷‍♂️😂 #KhabyLame #LifeHacks",
                "media_url": "https://images.unsplash.com/photo-1603145733146-ae562a55031e?w=800&h=600&fit=crop",
                "likes": 12000000, "comments": 245000, "shares": 3400000, "timestamp": "6 hours ago"
            },
            {
                "user": {"name": "Addison Rae", "username": "@addisonre", 
                         "avatar": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop"},
                "content": "Get ready with me 💄✨ #GRWM #MakeupTutorial",
                "media_url": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=600&fit=crop",
                "likes": 7100000, "comments": 98000, "shares": 890000, "timestamp": "8 hours ago"
            },
            {
                "user": {"name": "Zach King", "username": "@zachking", 
                         "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"},
                "content": "Magic trick reveal! Can you figure out how I did this? 🎩✨ #Magic",
                "media_url": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop",
                "likes": 15000000, "comments": 456000, "shares": 4200000, "timestamp": "10 hours ago"
            },
            {
                "user": {"name": "Spencer X", "username": "@spencerx", 
                         "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"},
                "content": "Beatbox tutorial part 3! 🎵 Drop a 🔥 if you learned it #Beatbox",
                "media_url": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
                "likes": 5600000, "comments": 67000, "shares": 780000, "timestamp": "12 hours ago"
            },
            {
                "user": {"name": "Loren Gray", "username": "@lorengray", 
                         "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"},
                "content": "New song dropping this Friday! Pre-save now 🎶 #NewMusic",
                "media_url": "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop",
                "likes": 6200000, "comments": 89000, "shares": 920000, "timestamp": "14 hours ago"
            },
            {
                "user": {"name": "Michael Le", "username": "@justmaiko", 
                         "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"},
                "content": "Insane dance transition! 🔥 How did I do? #DanceTransition",
                "media_url": "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&h=600&fit=crop",
                "likes": 8900000, "comments": 123000, "shares": 1800000, "timestamp": "16 hours ago"
            },
            {
                "user": {"name": "Dixie D'Amelio", "username": "@dixiedamelio", 
                         "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"},
                "content": "Behind the scenes of my latest music video 🎬 #BTS",
                "media_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=600&fit=crop",
                "likes": 6800000, "comments": 78000, "shares": 650000, "timestamp": "18 hours ago"
            },
            {
                "user": {"name": "Avani Gregg", "username": "@avani", 
                         "avatar": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop"},
                "content": "Clown makeup transformation 🤡 Part 4 #Makeup #Transformation",
                "media_url": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=600&fit=crop",
                "likes": 7500000, "comments": 98000, "shares": 1100000, "timestamp": "20 hours ago"
            },
            {
                "user": {"name": "Josh Richards", "username": "@joshrichards", 
                         "avatar": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop"},
                "content": "POV: You're the main character 😎 #POV #MainCharacter",
                "media_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop",
                "likes": 5200000, "comments": 56000, "shares": 490000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Riyaz Aly", "username": "@riyaz.14", 
                         "avatar": "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop"},
                "content": "Romantic transition video 💕 Tag your crush #Transition",
                "media_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop",
                "likes": 9200000, "comments": 145000, "shares": 1900000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Baby Ariel", "username": "@babyariel", 
                         "avatar": "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=100&h=100&fit=crop"},
                "content": "Singing challenge with friends! 🎤 #SingingChallenge",
                "media_url": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop",
                "likes": 4900000, "comments": 67000, "shares": 580000, "timestamp": "1 day ago"
            },
            {
                "user": {"name": "Noen Eubanks", "username": "@noeneubanks", 
                         "avatar": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop"},
                "content": "Aesthetic vibes only ✨ #Aesthetic #Vibes",
                "media_url": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800&h=600&fit=crop",
                "likes": 5800000, "comments": 72000, "shares": 670000, "timestamp": "2 days ago"
            },
            {
                "user": {"name": "Gilmher Croes", "username": "@gilmhercroes", 
                         "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"},
                "content": "Comedy skit with my brother 😂 #Comedy #Funny",
                "media_url": "https://images.unsplash.com/photo-1533450718592-29d45635f0a9?w=800&h=600&fit=crop",
                "likes": 6700000, "comments": 89000, "shares": 980000, "timestamp": "2 days ago"
            }
        ]
        
        # Transform to our format
        videos = []
        for i, sample in enumerate(sample_videos[:count]):
            video = self._transform_video(sample, f"tiktok_sample_{i}")
            if video:
                videos.append(video)
        
        return videos
    
    def _transform_video(self, tiktok_video: Dict, video_id: str) -> Dict:
        """Transform TikTok video data to our Post model format"""
        try:
            user = tiktok_video.get('user', {})
            
            # Determine category based on likes
            likes = tiktok_video.get('likes', 0)
            category = self._determine_category(likes)
            
            return {
                "platform": "tiktok",
                "platformColor": "#000000",
                "user": {
                    "name": user.get('name', 'Unknown User'),
                    "username": user.get('username', '@unknown'),
                    "avatar": user.get('avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop')
                },
                "content": tiktok_video.get('content', 'No caption'),
                "media": {
                    "type": "video",
                    "url": tiktok_video.get('media_url', 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=600&fit=crop'),
                    "thumbnail": tiktok_video.get('media_url', 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=600&fit=crop')
                },
                "likes": likes,
                "comments": tiktok_video.get('comments', 0),
                "shares": tiktok_video.get('shares', 0),
                "timestamp": tiktok_video.get('timestamp', 'recently'),
                "category": category,
                "tiktok_id": video_id
            }
            
        except Exception as e:
            logger.error(f"Error transforming TikTok video: {e}")
            return None
    
    def _determine_category(self, like_count: int) -> str:
        """Determine post category based on like count"""
        if like_count > 10000000:  # 10M+ likes
            return "viral"
        elif like_count > 5000000:  # 5M+ likes
            return "trending"
        else:
            return "most-liked"
