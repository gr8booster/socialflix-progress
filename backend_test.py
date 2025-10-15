#!/usr/bin/env python3
"""
ChyllApp Backend API Test Suite
Tests all backend API endpoints for functionality and data integrity
Including Sprint 1: Google OAuth Authentication endpoints
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Use the production backend URL from frontend/.env
BACKEND_URL = "https://contentchill.preview.emergentagent.com/api"

class ChyllAppAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.post_id_for_interactions = None
        
    def log_test(self, test_name: str, success: bool, message: str, response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def test_welcome_endpoint(self):
        """Test GET /api/ - Welcome message"""
        try:
            response = requests.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "ChyllApp" in data["message"]:
                    self.log_test("Welcome Endpoint", True, f"Got welcome message: {data['message']}")
                else:
                    self.log_test("Welcome Endpoint", False, f"Unexpected response format: {data}")
            else:
                self.log_test("Welcome Endpoint", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Welcome Endpoint", False, f"Request failed: {str(e)}")
    
    def test_get_all_posts(self):
        """Test GET /api/posts - Get all posts"""
        try:
            response = requests.get(f"{self.base_url}/posts")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    post_count = len(posts)
                    if post_count >= 18:  # At least 18 posts (may have more from scrapers)
                        self.log_test("Get All Posts", True, f"Retrieved {post_count} posts (expected at least 18)")
                        # Store first post ID for interaction tests
                        if posts:
                            self.post_id_for_interactions = posts[0]["id"]
                    else:
                        self.log_test("Get All Posts", False, f"Expected at least 18 posts, got {post_count}")
                    
                    # Validate post structure
                    if posts:
                        post = posts[0]
                        required_fields = ["id", "platform", "user", "content", "media", "likes", "comments", "shares", "category"]
                        missing_fields = [field for field in required_fields if field not in post]
                        if not missing_fields:
                            self.log_test("Post Structure Validation", True, "All required fields present in posts")
                        else:
                            self.log_test("Post Structure Validation", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_test("Get All Posts", False, f"Expected list, got {type(posts)}")
            else:
                self.log_test("Get All Posts", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get All Posts", False, f"Request failed: {str(e)}")
    
    def test_filter_by_platform(self):
        """Test GET /api/posts?platform=instagram - Filter by platform"""
        try:
            response = requests.get(f"{self.base_url}/posts?platform=instagram")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list) and posts:
                    # Check if all posts are from Instagram
                    instagram_posts = [p for p in posts if p.get("platform") == "instagram"]
                    if len(instagram_posts) == len(posts):
                        self.log_test("Filter by Platform (Instagram)", True, f"Retrieved {len(posts)} Instagram posts")
                    else:
                        self.log_test("Filter by Platform (Instagram)", False, f"Some posts are not from Instagram")
                else:
                    self.log_test("Filter by Platform (Instagram)", False, "No Instagram posts found or invalid response")
            else:
                self.log_test("Filter by Platform (Instagram)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Filter by Platform (Instagram)", False, f"Request failed: {str(e)}")
    
    def test_filter_by_category(self):
        """Test GET /api/posts?category=viral - Filter by category"""
        try:
            response = requests.get(f"{self.base_url}/posts?category=viral")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list) and posts:
                    # Check if all posts are from viral category
                    viral_posts = [p for p in posts if p.get("category") == "viral"]
                    if len(viral_posts) == len(posts):
                        self.log_test("Filter by Category (Viral)", True, f"Retrieved {len(posts)} viral posts")
                    else:
                        self.log_test("Filter by Category (Viral)", False, f"Some posts are not from viral category")
                else:
                    self.log_test("Filter by Category (Viral)", False, "No viral posts found or invalid response")
            else:
                self.log_test("Filter by Category (Viral)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Filter by Category (Viral)", False, f"Request failed: {str(e)}")
    
    def test_get_featured_post(self):
        """Test GET /api/posts/featured - Get featured post for hero section"""
        try:
            response = requests.get(f"{self.base_url}/posts/featured")
            if response.status_code == 200:
                post = response.json()
                if isinstance(post, dict):
                    # Should be from viral category with highest likes
                    if post.get("category") == "viral":
                        self.log_test("Get Featured Post", True, f"Featured post from viral category with {post.get('likes', 0)} likes")
                    else:
                        # Fallback case - any post with highest likes
                        self.log_test("Get Featured Post", True, f"Featured post (fallback) with {post.get('likes', 0)} likes")
                else:
                    self.log_test("Get Featured Post", False, f"Expected dict, got {type(post)}")
            else:
                self.log_test("Get Featured Post", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Featured Post", False, f"Request failed: {str(e)}")
    
    def test_get_platforms(self):
        """Test GET /api/platforms - Get list of platforms"""
        try:
            response = requests.get(f"{self.base_url}/platforms")
            if response.status_code == 200:
                platforms = response.json()
                if isinstance(platforms, list) and platforms:
                    expected_platforms = ["instagram", "twitter", "tiktok", "youtube", "facebook", "linkedin"]
                    platform_names = [p.get("platform") for p in platforms]
                    
                    # Check if all expected platforms are present
                    missing_platforms = [p for p in expected_platforms if p not in platform_names]
                    if not missing_platforms:
                        self.log_test("Get Platforms", True, f"Retrieved {len(platforms)} platforms: {platform_names}")
                    else:
                        self.log_test("Get Platforms", False, f"Missing platforms: {missing_platforms}")
                else:
                    self.log_test("Get Platforms", False, "No platforms found or invalid response")
            else:
                self.log_test("Get Platforms", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Platforms", False, f"Request failed: {str(e)}")
    
    def test_like_post(self):
        """Test POST /api/posts/{post_id}/like - Like a post"""
        if not self.post_id_for_interactions:
            self.log_test("Like Post", False, "No post ID available for interaction test")
            return
            
        try:
            # First get the current like count
            response = requests.get(f"{self.base_url}/posts/{self.post_id_for_interactions}")
            if response.status_code != 200:
                self.log_test("Like Post", False, f"Could not fetch post for like test: HTTP {response.status_code}")
                return
                
            original_post = response.json()
            original_likes = original_post.get("likes", 0)
            
            # Now like the post
            like_data = {"userId": "socialflix-tester"}
            response = requests.post(f"{self.base_url}/posts/{self.post_id_for_interactions}/like", 
                                   json=like_data)
            
            if response.status_code == 200:
                result = response.json()
                new_likes = result.get("likes", 0)
                if new_likes == original_likes + 1:
                    self.log_test("Like Post", True, f"Successfully liked post. Likes: {original_likes} → {new_likes}")
                else:
                    self.log_test("Like Post", False, f"Like count incorrect. Expected {original_likes + 1}, got {new_likes}")
            else:
                self.log_test("Like Post", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Like Post", False, f"Request failed: {str(e)}")
    
    def test_comment_post(self):
        """Test POST /api/posts/{post_id}/comment - Add comment"""
        if not self.post_id_for_interactions:
            self.log_test("Comment Post", False, "No post ID available for interaction test")
            return
            
        try:
            # First get the current comment count
            response = requests.get(f"{self.base_url}/posts/{self.post_id_for_interactions}")
            if response.status_code != 200:
                self.log_test("Comment Post", False, f"Could not fetch post for comment test: HTTP {response.status_code}")
                return
                
            original_post = response.json()
            original_comments = original_post.get("comments", 0)
            
            # Now add a comment
            comment_data = {"userId": "socialflix-tester", "comment": "Amazing content! Love this app!"}
            response = requests.post(f"{self.base_url}/posts/{self.post_id_for_interactions}/comment", 
                                   json=comment_data)
            
            if response.status_code == 200:
                result = response.json()
                new_comment_count = result.get("commentCount", 0)
                if new_comment_count == original_comments + 1:
                    self.log_test("Comment Post", True, f"Successfully added comment. Comments: {original_comments} → {new_comment_count}")
                else:
                    self.log_test("Comment Post", False, f"Comment count incorrect. Expected {original_comments + 1}, got {new_comment_count}")
            else:
                self.log_test("Comment Post", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Comment Post", False, f"Request failed: {str(e)}")
    
    def test_share_post(self):
        """Test POST /api/posts/{post_id}/share - Share a post"""
        if not self.post_id_for_interactions:
            self.log_test("Share Post", False, "No post ID available for interaction test")
            return
            
        try:
            # First get the current share count
            response = requests.get(f"{self.base_url}/posts/{self.post_id_for_interactions}")
            if response.status_code != 200:
                self.log_test("Share Post", False, f"Could not fetch post for share test: HTTP {response.status_code}")
                return
                
            original_post = response.json()
            original_shares = original_post.get("shares", 0)
            
            # Now share the post
            share_data = {"userId": "socialflix-tester"}
            response = requests.post(f"{self.base_url}/posts/{self.post_id_for_interactions}/share", 
                                   json=share_data)
            
            if response.status_code == 200:
                result = response.json()
                new_shares = result.get("shares", 0)
                if new_shares == original_shares + 1:
                    self.log_test("Share Post", True, f"Successfully shared post. Shares: {original_shares} → {new_shares}")
                else:
                    self.log_test("Share Post", False, f"Share count incorrect. Expected {original_shares + 1}, got {new_shares}")
            else:
                self.log_test("Share Post", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Share Post", False, f"Request failed: {str(e)}")
    
    # ============ Authentication Endpoint Tests ============
    
    def test_auth_me_without_authentication(self):
        """Test GET /api/auth/me without authentication - Should return 401"""
        try:
            response = requests.get(f"{self.base_url}/auth/me")
            if response.status_code == 401:
                self.log_test("Auth /me Without Authentication", True, "Correctly returned 401 Unauthorized")
            else:
                self.log_test("Auth /me Without Authentication", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Auth /me Without Authentication", False, f"Request failed: {str(e)}")
    
    def test_auth_me_with_invalid_token(self):
        """Test GET /api/auth/me with invalid session_token - Should return 401"""
        try:
            # Test with invalid cookie
            cookies = {"session_token": "invalid_token_12345"}
            response = requests.get(f"{self.base_url}/auth/me", cookies=cookies)
            if response.status_code == 401:
                self.log_test("Auth /me With Invalid Cookie Token", True, "Correctly returned 401 for invalid cookie token")
            else:
                self.log_test("Auth /me With Invalid Cookie Token", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
            
            # Test with invalid Authorization header
            headers = {"Authorization": "Bearer invalid_token_67890"}
            response = requests.get(f"{self.base_url}/auth/me", headers=headers)
            if response.status_code == 401:
                self.log_test("Auth /me With Invalid Bearer Token", True, "Correctly returned 401 for invalid bearer token")
            else:
                self.log_test("Auth /me With Invalid Bearer Token", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Auth /me With Invalid Token", False, f"Request failed: {str(e)}")
    
    def test_auth_logout(self):
        """Test POST /api/auth/logout - Should return success message"""
        try:
            response = requests.post(f"{self.base_url}/auth/logout")
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "message" in data:
                    self.log_test("Auth Logout", True, f"Logout successful: {data['message']}")
                else:
                    self.log_test("Auth Logout", False, f"Unexpected response format: {data}")
            else:
                self.log_test("Auth Logout", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Auth Logout", False, f"Request failed: {str(e)}")
    
    def test_auth_session_missing_session_id(self):
        """Test POST /api/auth/session without session_id - Should return error"""
        try:
            # Test with empty body
            response = requests.post(f"{self.base_url}/auth/session", json={})
            if response.status_code in [400, 422]:  # 422 is Pydantic validation error
                self.log_test("Auth Session Missing session_id", True, f"Correctly rejected empty session_id with HTTP {response.status_code}")
            else:
                self.log_test("Auth Session Missing session_id", False, f"Expected 400/422, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Auth Session Missing session_id", False, f"Request failed: {str(e)}")
    
    def test_auth_session_invalid_session_id(self):
        """Test POST /api/auth/session with invalid session_id - Should return error"""
        try:
            # Test with invalid session_id
            session_data = {"session_id": "invalid_session_id_12345"}
            response = requests.post(f"{self.base_url}/auth/session", json=session_data)
            # Should fail when calling Emergent Auth API
            if response.status_code in [400, 401, 500]:
                self.log_test("Auth Session Invalid session_id", True, f"Correctly rejected invalid session_id with HTTP {response.status_code}")
            else:
                self.log_test("Auth Session Invalid session_id", False, f"Expected error status, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Auth Session Invalid session_id", False, f"Request failed: {str(e)}")
    
    # ============ Search Endpoint Tests (Sprint 1.2) ============
    
    def test_search_basic_keyword(self):
        """Test GET /api/search with basic keyword search"""
        try:
            # Test with common keyword
            response = requests.get(f"{self.base_url}/search?q=viral")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    # Verify results contain the search term (case-insensitive)
                    matching_posts = []
                    for post in posts:
                        content = post.get("content", "").lower()
                        user_name = post.get("user", {}).get("name", "").lower()
                        user_username = post.get("user", {}).get("username", "").lower()
                        if "viral" in content or "viral" in user_name or "viral" in user_username:
                            matching_posts.append(post)
                    
                    if len(matching_posts) > 0:
                        self.log_test("Search Basic Keyword (viral)", True, f"Found {len(matching_posts)} posts matching 'viral'")
                    else:
                        self.log_test("Search Basic Keyword (viral)", False, "No posts found matching 'viral'")
                    
                    # Validate post structure
                    if posts:
                        post = posts[0]
                        required_fields = ["id", "platform", "user", "content", "likes", "comments"]
                        missing_fields = [field for field in required_fields if field not in post]
                        if not missing_fields:
                            self.log_test("Search Result Structure", True, "Search results have correct Post structure")
                        else:
                            self.log_test("Search Result Structure", False, f"Missing fields in search results: {missing_fields}")
                else:
                    self.log_test("Search Basic Keyword (viral)", False, f"Expected list, got {type(posts)}")
            else:
                self.log_test("Search Basic Keyword (viral)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Basic Keyword (viral)", False, f"Request failed: {str(e)}")
    
    def test_search_with_platform_filter(self):
        """Test GET /api/search with platform filter"""
        try:
            # Test search with platform filter
            response = requests.get(f"{self.base_url}/search?q=post&platform=reddit")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    if len(posts) > 0:
                        # Verify all results are from reddit
                        reddit_posts = [p for p in posts if p.get("platform") == "reddit"]
                        if len(reddit_posts) == len(posts):
                            self.log_test("Search with Platform Filter (reddit)", True, f"Found {len(posts)} reddit posts matching 'post'")
                        else:
                            non_reddit = len(posts) - len(reddit_posts)
                            self.log_test("Search with Platform Filter (reddit)", False, f"Found {non_reddit} non-reddit posts in results")
                    else:
                        # No results is acceptable if there are no reddit posts matching "post"
                        self.log_test("Search with Platform Filter (reddit)", True, "No reddit posts found matching 'post' (acceptable)")
                else:
                    self.log_test("Search with Platform Filter (reddit)", False, f"Expected list, got {type(posts)}")
            else:
                self.log_test("Search with Platform Filter (reddit)", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search with Platform Filter (reddit)", False, f"Request failed: {str(e)}")
    
    def test_search_sort_by_date(self):
        """Test GET /api/search with sort_by=date"""
        try:
            response = requests.get(f"{self.base_url}/search?q=the&sort_by=date")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list) and len(posts) >= 2:
                    # Verify posts are sorted by date (newest first)
                    dates_sorted = True
                    for i in range(len(posts) - 1):
                        current_date = posts[i].get("createdAt", "")
                        next_date = posts[i + 1].get("createdAt", "")
                        if current_date < next_date:
                            dates_sorted = False
                            break
                    
                    if dates_sorted:
                        self.log_test("Search Sort by Date", True, f"Results correctly sorted by date (newest first), {len(posts)} posts")
                    else:
                        self.log_test("Search Sort by Date", False, "Results not properly sorted by date")
                elif len(posts) == 1:
                    self.log_test("Search Sort by Date", True, "Only 1 result, sorting not applicable")
                else:
                    self.log_test("Search Sort by Date", True, "No results found for 'the' (acceptable)")
            else:
                self.log_test("Search Sort by Date", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Sort by Date", False, f"Request failed: {str(e)}")
    
    def test_search_sort_by_likes(self):
        """Test GET /api/search with sort_by=likes"""
        try:
            response = requests.get(f"{self.base_url}/search?q=the&sort_by=likes")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list) and len(posts) >= 2:
                    # Verify posts are sorted by likes (highest first)
                    likes_sorted = True
                    for i in range(len(posts) - 1):
                        current_likes = posts[i].get("likes", 0)
                        next_likes = posts[i + 1].get("likes", 0)
                        if current_likes < next_likes:
                            likes_sorted = False
                            break
                    
                    if likes_sorted:
                        self.log_test("Search Sort by Likes", True, f"Results correctly sorted by likes (highest first), {len(posts)} posts")
                    else:
                        self.log_test("Search Sort by Likes", False, "Results not properly sorted by likes")
                elif len(posts) == 1:
                    self.log_test("Search Sort by Likes", True, "Only 1 result, sorting not applicable")
                else:
                    self.log_test("Search Sort by Likes", True, "No results found for 'the' (acceptable)")
            else:
                self.log_test("Search Sort by Likes", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Sort by Likes", False, f"Request failed: {str(e)}")
    
    def test_search_sort_by_comments(self):
        """Test GET /api/search with sort_by=comments"""
        try:
            response = requests.get(f"{self.base_url}/search?q=the&sort_by=comments")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list) and len(posts) >= 2:
                    # Verify posts are sorted by comments (highest first)
                    comments_sorted = True
                    for i in range(len(posts) - 1):
                        current_comments = posts[i].get("comments", 0)
                        next_comments = posts[i + 1].get("comments", 0)
                        if current_comments < next_comments:
                            comments_sorted = False
                            break
                    
                    if comments_sorted:
                        self.log_test("Search Sort by Comments", True, f"Results correctly sorted by comments (highest first), {len(posts)} posts")
                    else:
                        self.log_test("Search Sort by Comments", False, "Results not properly sorted by comments")
                elif len(posts) == 1:
                    self.log_test("Search Sort by Comments", True, "Only 1 result, sorting not applicable")
                else:
                    self.log_test("Search Sort by Comments", True, "No results found for 'the' (acceptable)")
            else:
                self.log_test("Search Sort by Comments", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Sort by Comments", False, f"Request failed: {str(e)}")
    
    def test_search_sort_by_relevance(self):
        """Test GET /api/search with sort_by=relevance (default)"""
        try:
            response = requests.get(f"{self.base_url}/search?q=video&sort_by=relevance")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    if len(posts) > 0:
                        self.log_test("Search Sort by Relevance", True, f"Found {len(posts)} posts with relevance sorting")
                    else:
                        self.log_test("Search Sort by Relevance", True, "No results found for 'video' (acceptable)")
                else:
                    self.log_test("Search Sort by Relevance", False, f"Expected list, got {type(posts)}")
            else:
                self.log_test("Search Sort by Relevance", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Sort by Relevance", False, f"Request failed: {str(e)}")
    
    def test_search_no_results(self):
        """Test GET /api/search with query that returns no results"""
        try:
            response = requests.get(f"{self.base_url}/search?q=xyzabc123nonexistent")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list) and len(posts) == 0:
                    self.log_test("Search No Results", True, "Correctly returned empty array for non-existent query")
                else:
                    self.log_test("Search No Results", False, f"Expected empty array, got {len(posts)} results")
            else:
                self.log_test("Search No Results", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search No Results", False, f"Request failed: {str(e)}")
    
    def test_search_missing_query_parameter(self):
        """Test GET /api/search without query parameter - Should return 422"""
        try:
            response = requests.get(f"{self.base_url}/search")
            if response.status_code == 422:
                self.log_test("Search Missing Query Parameter", True, "Correctly returned 422 validation error for missing 'q' parameter")
            else:
                self.log_test("Search Missing Query Parameter", False, f"Expected 422, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Missing Query Parameter", False, f"Request failed: {str(e)}")
    
    def test_search_empty_string(self):
        """Test GET /api/search with empty string query"""
        try:
            response = requests.get(f"{self.base_url}/search?q=")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    # Empty string might return all posts or no posts depending on implementation
                    self.log_test("Search Empty String", True, f"Handled empty string query, returned {len(posts)} posts")
                else:
                    self.log_test("Search Empty String", False, f"Expected list, got {type(posts)}")
            elif response.status_code == 422:
                self.log_test("Search Empty String", True, "Correctly rejected empty string with 422 validation error")
            else:
                self.log_test("Search Empty String", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Empty String", False, f"Request failed: {str(e)}")
    
    def test_search_special_characters(self):
        """Test GET /api/search with special characters"""
        try:
            response = requests.get(f"{self.base_url}/search?q=@#$%")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    self.log_test("Search Special Characters", True, f"Handled special characters query, returned {len(posts)} posts")
                else:
                    self.log_test("Search Special Characters", False, f"Expected list, got {type(posts)}")
            else:
                self.log_test("Search Special Characters", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Search Special Characters", False, f"Request failed: {str(e)}")
    
    def test_search_case_insensitive(self):
        """Test that search is case-insensitive"""
        try:
            # Search with uppercase
            response_upper = requests.get(f"{self.base_url}/search?q=VIRAL")
            # Search with lowercase
            response_lower = requests.get(f"{self.base_url}/search?q=viral")
            
            if response_upper.status_code == 200 and response_lower.status_code == 200:
                posts_upper = response_upper.json()
                posts_lower = response_lower.json()
                
                if len(posts_upper) == len(posts_lower) and len(posts_upper) > 0:
                    self.log_test("Search Case Insensitive", True, f"Case-insensitive search working: 'VIRAL' and 'viral' both returned {len(posts_upper)} posts")
                elif len(posts_upper) == len(posts_lower) == 0:
                    self.log_test("Search Case Insensitive", True, "Both searches returned 0 results (acceptable)")
                else:
                    self.log_test("Search Case Insensitive", False, f"Case sensitivity issue: 'VIRAL' returned {len(posts_upper)}, 'viral' returned {len(posts_lower)}")
            else:
                self.log_test("Search Case Insensitive", False, f"HTTP errors: upper={response_upper.status_code}, lower={response_lower.status_code}")
        except Exception as e:
            self.log_test("Search Case Insensitive", False, f"Request failed: {str(e)}")
    
    # ============ User Profile & Favorites Endpoint Tests (Sprint 2.1) ============
    
    def test_user_profile_without_auth(self):
        """Test GET /api/user/profile without authentication - Should return 401"""
        try:
            response = requests.get(f"{self.base_url}/user/profile")
            if response.status_code == 401:
                data = response.json()
                self.log_test("User Profile Without Auth", True, f"Correctly returned 401: {data.get('detail', 'Not authenticated')}")
            else:
                self.log_test("User Profile Without Auth", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Profile Without Auth", False, f"Request failed: {str(e)}")
    
    def test_user_profile_with_invalid_token(self):
        """Test GET /api/user/profile with invalid token - Should return 401"""
        try:
            # Test with invalid cookie
            cookies = {"session_token": "invalid_token_profile_test"}
            response = requests.get(f"{self.base_url}/user/profile", cookies=cookies)
            if response.status_code == 401:
                self.log_test("User Profile With Invalid Cookie", True, "Correctly returned 401 for invalid cookie token")
            else:
                self.log_test("User Profile With Invalid Cookie", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
            
            # Test with invalid Authorization header
            headers = {"Authorization": "Bearer invalid_bearer_token_profile"}
            response = requests.get(f"{self.base_url}/user/profile", headers=headers)
            if response.status_code == 401:
                self.log_test("User Profile With Invalid Bearer", True, "Correctly returned 401 for invalid bearer token")
            else:
                self.log_test("User Profile With Invalid Bearer", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("User Profile With Invalid Token", False, f"Request failed: {str(e)}")
    
    def test_update_profile_without_auth(self):
        """Test PUT /api/user/profile without authentication - Should return 401"""
        try:
            profile_data = {"name": "John Doe", "bio": "Love viral content!"}
            response = requests.put(f"{self.base_url}/user/profile", json=profile_data)
            if response.status_code == 401:
                data = response.json()
                self.log_test("Update Profile Without Auth", True, f"Correctly returned 401: {data.get('detail', 'Not authenticated')}")
            else:
                self.log_test("Update Profile Without Auth", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Update Profile Without Auth", False, f"Request failed: {str(e)}")
    
    def test_update_profile_with_invalid_token(self):
        """Test PUT /api/user/profile with invalid token - Should return 401"""
        try:
            profile_data = {"name": "Jane Smith", "bio": "Testing profile update"}
            cookies = {"session_token": "invalid_token_update_profile"}
            response = requests.put(f"{self.base_url}/user/profile", json=profile_data, cookies=cookies)
            if response.status_code == 401:
                self.log_test("Update Profile With Invalid Token", True, "Correctly returned 401 for invalid token")
            else:
                self.log_test("Update Profile With Invalid Token", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Update Profile With Invalid Token", False, f"Request failed: {str(e)}")
    
    def test_toggle_favorite_without_auth(self):
        """Test POST /api/user/favorites/{post_id} without authentication - Should return 401"""
        try:
            # Use a valid post_id format (UUID)
            test_post_id = "test-post-id-12345"
            response = requests.post(f"{self.base_url}/user/favorites/{test_post_id}")
            if response.status_code == 401:
                data = response.json()
                self.log_test("Toggle Favorite Without Auth", True, f"Correctly returned 401: {data.get('detail', 'Not authenticated')}")
            else:
                self.log_test("Toggle Favorite Without Auth", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Toggle Favorite Without Auth", False, f"Request failed: {str(e)}")
    
    def test_toggle_favorite_with_invalid_token(self):
        """Test POST /api/user/favorites/{post_id} with invalid token - Should return 401"""
        try:
            test_post_id = "test-post-id-67890"
            cookies = {"session_token": "invalid_token_favorite"}
            response = requests.post(f"{self.base_url}/user/favorites/{test_post_id}", cookies=cookies)
            if response.status_code == 401:
                self.log_test("Toggle Favorite With Invalid Token", True, "Correctly returned 401 for invalid token")
            else:
                self.log_test("Toggle Favorite With Invalid Token", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Toggle Favorite With Invalid Token", False, f"Request failed: {str(e)}")
    
    def test_get_favorites_without_auth(self):
        """Test GET /api/user/favorites without authentication - Should return 401"""
        try:
            response = requests.get(f"{self.base_url}/user/favorites")
            if response.status_code == 401:
                data = response.json()
                self.log_test("Get Favorites Without Auth", True, f"Correctly returned 401: {data.get('detail', 'Not authenticated')}")
            else:
                self.log_test("Get Favorites Without Auth", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Favorites Without Auth", False, f"Request failed: {str(e)}")
    
    def test_get_favorites_with_invalid_token(self):
        """Test GET /api/user/favorites with invalid token - Should return 401"""
        try:
            cookies = {"session_token": "invalid_token_get_favorites"}
            response = requests.get(f"{self.base_url}/user/favorites", cookies=cookies)
            if response.status_code == 401:
                self.log_test("Get Favorites With Invalid Token", True, "Correctly returned 401 for invalid token")
            else:
                self.log_test("Get Favorites With Invalid Token", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Favorites With Invalid Token", False, f"Request failed: {str(e)}")
    
    def test_update_preferences_without_auth(self):
        """Test PUT /api/user/preferences without authentication - Should return 401"""
        try:
            preferences_data = {"favorite_platforms": ["youtube", "reddit", "tiktok"]}
            response = requests.put(f"{self.base_url}/user/preferences", json=preferences_data)
            if response.status_code == 401:
                data = response.json()
                self.log_test("Update Preferences Without Auth", True, f"Correctly returned 401: {data.get('detail', 'Not authenticated')}")
            else:
                self.log_test("Update Preferences Without Auth", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Update Preferences Without Auth", False, f"Request failed: {str(e)}")
    
    def test_update_preferences_with_invalid_token(self):
        """Test PUT /api/user/preferences with invalid token - Should return 401"""
        try:
            preferences_data = {"favorite_platforms": ["instagram", "twitter"]}
            cookies = {"session_token": "invalid_token_preferences"}
            response = requests.put(f"{self.base_url}/user/preferences", json=preferences_data, cookies=cookies)
            if response.status_code == 401:
                self.log_test("Update Preferences With Invalid Token", True, "Correctly returned 401 for invalid token")
            else:
                self.log_test("Update Preferences With Invalid Token", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Update Preferences With Invalid Token", False, f"Request failed: {str(e)}")
    
    def test_get_activity_without_auth(self):
        """Test GET /api/user/activity without authentication - Should return 401"""
        try:
            response = requests.get(f"{self.base_url}/user/activity")
            if response.status_code == 401:
                data = response.json()
                self.log_test("Get Activity Without Auth", True, f"Correctly returned 401: {data.get('detail', 'Not authenticated')}")
            else:
                self.log_test("Get Activity Without Auth", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Activity Without Auth", False, f"Request failed: {str(e)}")
    
    def test_get_activity_with_invalid_token(self):
        """Test GET /api/user/activity with invalid token - Should return 401"""
        try:
            cookies = {"session_token": "invalid_token_activity"}
            response = requests.get(f"{self.base_url}/user/activity", cookies=cookies)
            if response.status_code == 401:
                self.log_test("Get Activity With Invalid Token", True, "Correctly returned 401 for invalid token")
            else:
                self.log_test("Get Activity With Invalid Token", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Activity With Invalid Token", False, f"Request failed: {str(e)}")
    
    def test_get_activity_with_limit_param(self):
        """Test GET /api/user/activity with limit parameter (without auth) - Should return 401"""
        try:
            response = requests.get(f"{self.base_url}/user/activity?limit=10")
            if response.status_code == 401:
                self.log_test("Get Activity With Limit Param (No Auth)", True, "Correctly returned 401 even with valid limit parameter")
            else:
                self.log_test("Get Activity With Limit Param (No Auth)", False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Get Activity With Limit Param (No Auth)", False, f"Request failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting ChyllApp Backend API Tests")
        print(f"📡 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Basic endpoint tests
        self.test_welcome_endpoint()
        self.test_get_all_posts()
        self.test_filter_by_platform()
        self.test_filter_by_category()
        self.test_get_featured_post()
        self.test_get_platforms()
        
        # Interaction tests (require post ID from get_all_posts)
        self.test_like_post()
        self.test_comment_post()
        self.test_share_post()
        
        # Authentication endpoint tests
        print("\n" + "=" * 60)
        print("🔐 Testing Authentication Endpoints (Sprint 1: Google OAuth)")
        print("=" * 60)
        self.test_auth_me_without_authentication()
        self.test_auth_me_with_invalid_token()
        self.test_auth_logout()
        self.test_auth_session_missing_session_id()
        self.test_auth_session_invalid_session_id()
        
        # Search endpoint tests (Sprint 1.2)
        print("\n" + "=" * 60)
        print("🔍 Testing Search Functionality (Sprint 1.2: Working Search)")
        print("=" * 60)
        self.test_search_basic_keyword()
        self.test_search_with_platform_filter()
        self.test_search_sort_by_date()
        self.test_search_sort_by_likes()
        self.test_search_sort_by_comments()
        self.test_search_sort_by_relevance()
        self.test_search_no_results()
        self.test_search_missing_query_parameter()
        self.test_search_empty_string()
        self.test_search_special_characters()
        self.test_search_case_insensitive()
        
        # Summary
        print("=" * 60)
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! ChyllApp backend is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            failed_tests = [result for result in self.test_results if not result["success"]]
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = ChyllAppAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)