import requests
import logging
from typing import List, Dict
import os
import time

logger = logging.getLogger(__name__)

class YouTubeScraper:
    """Scraper for fetching trending videos from YouTube using YouTube Data API v3"""
    
    BASE_URL = "https://www.googleapis.com/youtube/v3"
    
    def __init__(self):
        self.api_key = os.getenv('YOUTUBE_API_KEY')
        if not self.api_key:
            logger.warning("YouTube API key not found in environment variables")
    
    def fetch_trending_videos(self, max_results: int = 50, region_code: str = 'US') -> List[Dict]:
        """
        Fetch trending videos from YouTube
        
        Args:
            max_results: Number of videos to fetch (max 50 per request)
            region_code: Region code for trending videos (US, GB, etc.)
        
        Returns:
            List of video dictionaries
        """
        if not self.api_key:
            logger.error("Cannot fetch YouTube videos: API key not available")
            return []
        
        try:
            url = f"{self.BASE_URL}/videos"
            params = {
                'part': 'snippet,statistics,contentDetails',
                'chart': 'mostPopular',
                'regionCode': region_code,
                'maxResults': min(max_results, 50),
                'key': self.api_key
            }
            
            logger.info(f"Fetching trending videos from YouTube ({region_code})")
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            videos = []
            
            for item in data.get('items', []):
                video = self._transform_video(item)
                if video:
                    videos.append(video)
            
            logger.info(f"Successfully fetched {len(videos)} videos from YouTube")
            return videos
            
        except requests.RequestException as e:
            logger.error(f"Error fetching YouTube videos: {e}")
            return []
    
    def search_videos(self, query: str, max_results: int = 25) -> List[Dict]:
        """
        Search for videos on YouTube
        
        Args:
            query: Search query
            max_results: Number of results to return
        
        Returns:
            List of video dictionaries
        """
        if not self.api_key:
            logger.error("Cannot search YouTube videos: API key not available")
            return []
        
        try:
            url = f"{self.BASE_URL}/search"
            params = {
                'part': 'snippet',
                'q': query,
                'type': 'video',
                'order': 'viewCount',
                'maxResults': min(max_results, 50),
                'key': self.api_key
            }
            
            logger.info(f"Searching YouTube for: {query}")
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            video_ids = [item['id']['videoId'] for item in data.get('items', [])]
            
            # Get full details for these videos
            if video_ids:
                return self._get_video_details(video_ids)
            
            return []
            
        except requests.RequestException as e:
            logger.error(f"Error searching YouTube: {e}")
            return []
    
    def _get_video_details(self, video_ids: List[str]) -> List[Dict]:
        """Get detailed information for multiple videos"""
        try:
            url = f"{self.BASE_URL}/videos"
            params = {
                'part': 'snippet,statistics,contentDetails',
                'id': ','.join(video_ids),
                'key': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            videos = []
            
            for item in data.get('items', []):
                video = self._transform_video(item)
                if video:
                    videos.append(video)
            
            return videos
            
        except requests.RequestException as e:
            logger.error(f"Error getting YouTube video details: {e}")
            return []
    
    def _transform_video(self, youtube_video: Dict) -> Dict:
        """
        Transform YouTube video data to our Post model format
        
        Args:
            youtube_video: Raw YouTube video data
        
        Returns:
            Transformed post dictionary
        """
        try:
            snippet = youtube_video.get('snippet', {})
            statistics = youtube_video.get('statistics', {})
            video_id = youtube_video.get('id')
            
            # Get thumbnail (use maxres, high, or medium quality)
            thumbnails = snippet.get('thumbnails', {})
            thumbnail_url = (
                thumbnails.get('maxres', {}).get('url') or
                thumbnails.get('high', {}).get('url') or
                thumbnails.get('medium', {}).get('url') or
                'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=600&fit=crop'
            )
            
            # Calculate time ago
            published_at = snippet.get('publishedAt', '')
            time_ago = self._calculate_time_ago(published_at)
            
            # Determine category based on view count
            view_count = int(statistics.get('viewCount', 0))
            category = self._determine_category(view_count)
            
            return {
                "platform": "youtube",
                "platformColor": "#FF0000",
                "user": {
                    "name": snippet.get('channelTitle', 'Unknown Channel'),
                    "username": f"@{snippet.get('channelTitle', 'unknown').replace(' ', '')}",
                    "avatar": thumbnail_url
                },
                "content": snippet.get('title', 'Untitled Video'),
                "media": {
                    "type": "video",
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "thumbnail": thumbnail_url
                },
                "likes": int(statistics.get('likeCount', 0)),
                "comments": int(statistics.get('commentCount', 0)),
                "shares": 0,  # YouTube API doesn't provide share count
                "timestamp": time_ago,
                "category": category,
                "youtube_id": video_id,
                "youtube_url": f"https://www.youtube.com/watch?v={video_id}"
            }
            
        except Exception as e:
            logger.error(f"Error transforming YouTube video: {e}")
            return None
    
    def _calculate_time_ago(self, published_at: str) -> str:
        """Calculate human-readable time ago from ISO timestamp"""
        try:
            from datetime import datetime
            published = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
            now = datetime.now(published.tzinfo)
            diff = now - published
            
            days = diff.days
            if days == 0:
                hours = diff.seconds // 3600
                if hours == 0:
                    minutes = diff.seconds // 60
                    return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
                return f"{hours} hour{'s' if hours != 1 else ''} ago"
            elif days < 30:
                return f"{days} day{'s' if days != 1 else ''} ago"
            elif days < 365:
                months = days // 30
                return f"{months} month{'s' if months != 1 else ''} ago"
            else:
                years = days // 365
                return f"{years} year{'s' if years != 1 else ''} ago"
        except:
            return "recently"
    
    def _determine_category(self, view_count: int) -> str:
        """Determine post category based on view count"""
        if view_count > 10000000:  # 10M+ views
            return "viral"
        elif view_count > 1000000:  # 1M+ views
            return "trending"
        else:
            return "most-liked"
