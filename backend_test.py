#!/usr/bin/env python3
"""
SocialFlix Backend API Test Suite
Tests all backend API endpoints for functionality and data integrity
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Use the production backend URL from frontend/.env
BACKEND_URL = "https://socialflix-1.preview.emergentagent.com/api"

class SocialFlixAPITester:
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
                if "message" in data and "SocialFlix" in data["message"]:
                    self.log_test("Welcome Endpoint", True, f"Got welcome message: {data['message']}")
                else:
                    self.log_test("Welcome Endpoint", False, f"Unexpected response format: {data}")
            else:
                self.log_test("Welcome Endpoint", False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_test("Welcome Endpoint", False, f"Request failed: {str(e)}")
    
    def test_get_all_posts(self):
        """Test GET /api/posts - Get all posts (should return 18 posts)"""
        try:
            response = requests.get(f"{self.base_url}/posts")
            if response.status_code == 200:
                posts = response.json()
                if isinstance(posts, list):
                    post_count = len(posts)
                    if post_count == 18:
                        self.log_test("Get All Posts", True, f"Retrieved {post_count} posts as expected")
                        # Store first post ID for interaction tests
                        if posts:
                            self.post_id_for_interactions = posts[0]["id"]
                    else:
                        self.log_test("Get All Posts", False, f"Expected 18 posts, got {post_count}")
                    
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
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting SocialFlix Backend API Tests")
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
        
        # Summary
        print("=" * 60)
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! SocialFlix backend is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the details above.")
            failed_tests = [result for result in self.test_results if not result["success"]]
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = SocialFlixAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)