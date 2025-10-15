import requests
import logging
from typing import List, Dict
import os
import time

logger = logging.getLogger(__name__)

class TwitterScraper:
    """Scraper for fetching trending tweets from Twitter/X using Twitter API v2"""
    
    BASE_URL = "https://api.twitter.com/2"
    
    def __init__(self):
        self.bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        self.api_key = os.getenv('TWITTER_API_KEY')
        self.api_secret = os.getenv('TWITTER_API_SECRET')
        
        if not self.bearer_token:
            logger.warning("Twitter Bearer Token not found in environment variables")
        
        self.session = requests.Session()
        if self.bearer_token:
            self.session.headers.update({
                'Authorization': f'Bearer {self.bearer_token}',
                'User-Agent': 'ChyllApp v2.0'
            })
    
    def fetch_trending_tweets(self, max_results: int = 50) -> List[Dict]:
        """
        Fetch trending tweets from Twitter
        
        Args:
            max_results: Number of tweets to fetch (10-100)
        
        Returns:
            List of tweet dictionaries
        """
        if not self.bearer_token:
            logger.error("Cannot fetch tweets: Bearer token not available")
            return []
        
        try:
            # Search for popular tweets with high engagement
            url = f"{self.BASE_URL}/tweets/search/recent"
            
            # Search queries for viral content
            queries = [
                "(viral OR trending) -is:retweet has:media lang:en",
                "breaking news -is:retweet has:media lang:en",
                "(amazing OR incredible) -is:retweet has:images lang:en"
            ]
            
            all_tweets = []
            
            for query in queries:
                params = {
                    'query': query,
                    'max_results': min(max_results // len(queries), 100),
                    'tweet.fields': 'created_at,public_metrics,author_id,attachments',
                    'expansions': 'author_id,attachments.media_keys',
                    'user.fields': 'name,username,profile_image_url',
                    'media.fields': 'url,preview_image_url,type'
                }
                
                logger.info(f"Fetching tweets for query: {query[:30]}...")
                response = self.session.get(url, params=params, timeout=15)
                
                if response.status_code == 200:
                    data = response.json()
                    tweets = self._process_tweets(data)
                    all_tweets.extend(tweets)
                elif response.status_code == 429:
                    logger.warning("Twitter API rate limit reached")
                    break
                else:
                    logger.error(f"Error fetching tweets: {response.status_code} - {response.text}")
                
                # Rate limiting
                time.sleep(1)
            
            # Remove duplicates and sort by engagement
            unique_tweets = {t['twitter_id']: t for t in all_tweets}.values()
            sorted_tweets = sorted(
                unique_tweets, 
                key=lambda x: x['likes'] + x['comments'] + x['shares'], 
                reverse=True
            )
            
            logger.info(f"Successfully fetched {len(sorted_tweets)} unique tweets")
            return list(sorted_tweets)[:max_results]
            
        except requests.RequestException as e:
            logger.error(f"Error fetching tweets: {e}")
            return []
    
    def _process_tweets(self, data: Dict) -> List[Dict]:
        """Process Twitter API response and transform tweets"""
        tweets = []
        
        tweet_data = data.get('data', [])
        includes = data.get('includes', {})
        users = {user['id']: user for user in includes.get('users', [])}
        media = {m['media_key']: m for m in includes.get('media', [])}
        
        for tweet in tweet_data:
            try:
                author_id = tweet.get('author_id')
                author = users.get(author_id, {})
                
                # Get media
                media_keys = tweet.get('attachments', {}).get('media_keys', [])
                tweet_media = None
                media_type = 'text'
                
                if media_keys:
                    first_media = media.get(media_keys[0], {})
                    media_type = first_media.get('type', 'text')
                    
                    if media_type == 'photo':
                        tweet_media = first_media.get('url')
                    elif media_type == 'video':
                        tweet_media = first_media.get('preview_image_url')
                
                # Skip tweets without media
                if not tweet_media:
                    continue
                
                transformed = self._transform_tweet(tweet, author, tweet_media, media_type)
                if transformed:
                    tweets.append(transformed)
                    
            except Exception as e:
                logger.error(f"Error processing tweet: {e}")
                continue
        
        return tweets
    
    def _transform_tweet(self, tweet: Dict, author: Dict, media_url: str, media_type: str) -> Dict:
        """Transform Twitter tweet data to our Post model format"""
        try:
            metrics = tweet.get('public_metrics', {})
            
            # Calculate time ago
            created_at = tweet.get('created_at', '')
            time_ago = self._calculate_time_ago(created_at)
            
            # Determine category based on engagement
            like_count = metrics.get('like_count', 0)
            category = self._determine_category(like_count)
            
            # Get author info
            author_name = author.get('name', 'Unknown User')
            author_username = author.get('username', 'unknown')
            author_avatar = author.get('profile_image_url', 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop')
            
            return {
                "platform": "twitter",
                "platformColor": "#1DA1F2",
                "user": {
                    "name": author_name,
                    "username": f"@{author_username}",
                    "avatar": author_avatar
                },
                "content": tweet.get('text', 'No content'),
                "media": {
                    "type": "image" if media_type == 'photo' else "video",
                    "url": media_url,
                    "thumbnail": media_url
                },
                "likes": metrics.get('like_count', 0),
                "comments": metrics.get('reply_count', 0),
                "shares": metrics.get('retweet_count', 0),
                "timestamp": time_ago,
                "category": category,
                "twitter_id": tweet.get('id'),
                "twitter_url": f"https://twitter.com/{author_username}/status/{tweet.get('id')}"
            }
            
        except Exception as e:
            logger.error(f"Error transforming tweet: {e}")
            return None
    
    def _calculate_time_ago(self, created_at: str) -> str:
        """Calculate human-readable time ago from ISO timestamp"""
        try:
            from datetime import datetime
            created = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            now = datetime.now(created.tzinfo)
            diff = now - created
            
            days = diff.days
            if days == 0:
                hours = diff.seconds // 3600
                if hours == 0:
                    minutes = diff.seconds // 60
                    return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
                return f"{hours} hour{'s' if hours != 1 else ''} ago"
            elif days < 30:
                return f"{days} day{'s' if days != 1 else ''} ago"
            else:
                return "recently"
        except:
            return "recently"
    
    def _determine_category(self, like_count: int) -> str:
        """Determine post category based on like count"""
        if like_count > 50000:
            return "viral"
        elif like_count > 10000:
            return "trending"
        else:
            return "most-liked"
