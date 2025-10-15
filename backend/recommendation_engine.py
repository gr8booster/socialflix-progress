import os
import logging
from typing import List, Dict
from emergentintegrations.llm.chat import LlmChat, UserMessage
import json

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """AI-powered recommendation engine using LLM"""
    
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            logger.warning("EMERGENT_LLM_KEY not found in environment")
    
    async def get_recommendations(self, user_profile: Dict, available_posts: List[Dict], limit: int = 10) -> List[str]:
        """
        Get personalized post recommendations for a user
        
        Args:
            user_profile: User's interaction data (liked posts, saved posts, preferences)
            available_posts: List of available posts to recommend from
            limit: Number of recommendations to return
        
        Returns:
            List of post IDs ranked by relevance
        """
        if not self.api_key:
            logger.error("Cannot generate recommendations: API key not available")
            return []
        
        try:
            # Build user interest profile
            user_interests = self._build_interest_profile(user_profile)
            
            # Prepare posts for analysis
            posts_summary = self._summarize_posts(available_posts[:50])  # Limit to 50 for API efficiency
            
            # Create AI chat
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"recommendations_{user_profile.get('user_id', 'guest')}",
                system_message="You are an expert content recommendation engine. Analyze user interests and recommend the most relevant social media posts."
            ).with_model("openai", "gpt-4o-mini")
            
            # Create recommendation prompt
            prompt = f"""Based on this user's interests and the available posts, recommend the TOP {limit} most relevant posts.

USER INTERESTS:
{json.dumps(user_interests, indent=2)}

AVAILABLE POSTS:
{json.dumps(posts_summary, indent=2)}

Return ONLY a JSON array of post IDs in order of relevance (most relevant first).
Format: ["post_id_1", "post_id_2", ...]
Do not include any explanation, only the JSON array."""

            message = UserMessage(text=prompt)
            response = await chat.send_message(message)
            
            # Parse AI response
            try:
                # Extract JSON from response
                response_text = response.strip()
                if response_text.startswith('```'):
                    # Remove markdown code blocks
                    response_text = response_text.split('```')[1]
                    if response_text.startswith('json'):
                        response_text = response_text[4:]
                
                recommended_ids = json.loads(response_text.strip())
                
                logger.info(f"AI recommended {len(recommended_ids)} posts for user")
                return recommended_ids[:limit]
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI response: {e}")
                logger.error(f"Response was: {response}")
                return []
        
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            return []
    
    def _build_interest_profile(self, user_profile: Dict) -> Dict:
        """Build a summary of user interests from their activity"""
        return {
            "favorite_platforms": user_profile.get("favorite_platforms", []),
            "saved_posts_count": len(user_profile.get("favorite_posts", [])),
            "recent_likes": user_profile.get("recent_likes", []),
            "preferred_categories": user_profile.get("preferred_categories", ["viral", "trending"]),
            "engagement_level": "high" if len(user_profile.get("favorite_posts", [])) > 5 else "medium"
        }
    
    def _summarize_posts(self, posts: List[Dict]) -> List[Dict]:
        """Create a condensed summary of posts for AI analysis"""
        summaries = []
        for post in posts:
            summaries.append({
                "id": post["id"],
                "platform": post["platform"],
                "content": post["content"][:200],  # Truncate for efficiency
                "category": post["category"],
                "likes": post["likes"],
                "comments": post["comments"]
            })
        return summaries
    
    async def detect_trending_topics(self, posts: List[Dict]) -> List[Dict]:
        """Detect trending topics from recent posts using AI"""
        if not self.api_key:
            return []
        
        try:
            # Get recent high-engagement posts
            posts_content = [
                {"content": p["content"], "platform": p["platform"], "likes": p["likes"]}
                for p in posts[:30]
            ]
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id="trending_topics",
                system_message="You are a trending topics analyst. Identify trending themes and topics from social media posts."
            ).with_model("openai", "gpt-4o-mini")
            
            prompt = f"""Analyze these posts and identify the TOP 5 trending topics/themes.

POSTS:
{json.dumps(posts_content, indent=2)}

Return ONLY a JSON array of trending topics with format:
[
  {{"topic": "topic name", "count": number_of_posts, "platforms": ["platform1", "platform2"]}},
  ...
]"""

            message = UserMessage(text=prompt)
            response = await chat.send_message(message)
            
            # Parse response
            response_text = response.strip()
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
            
            topics = json.loads(response_text.strip())
            return topics
            
        except Exception as e:
            logger.error(f"Error detecting trending topics: {e}")
            return []
