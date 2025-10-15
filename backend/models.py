from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

class MediaInfo(BaseModel):
    type: str  # 'image' or 'video'
    url: str
    thumbnail: Optional[str] = None

class UserInfo(BaseModel):
    name: str
    username: str
    avatar: str

class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str
    platformColor: str
    user: UserInfo
    content: str
    media: MediaInfo
    likes: int
    comments: int
    shares: int
    timestamp: str
    category: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class PostCreate(BaseModel):
    platform: str
    platformColor: str
    user: UserInfo
    content: str
    media: MediaInfo
    likes: int
    comments: int
    shares: int
    timestamp: str
    category: str

class LikeRequest(BaseModel):
    userId: str

class CommentRequest(BaseModel):
    userId: str
    comment: str

class ShareRequest(BaseModel):
    userId: str

class PlatformInfo(BaseModel):
    platform: str
    name: str
    color: str
    icon: str

# User Authentication Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    google_id: Optional[str] = None
    bio: Optional[str] = None
    favorite_posts: List[str] = Field(default_factory=list)
    favorite_platforms: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionCreate(BaseModel):
    session_id: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    bio: Optional[str] = None
    favorite_posts: List[str] = Field(default_factory=list)
    favorite_platforms: List[str] = Field(default_factory=list)

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    picture: Optional[str] = None

class UserPreferences(BaseModel):
    favorite_platforms: List[str]

class ActivityItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action: str  # 'like', 'comment', 'share', 'favorite'
    post_id: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomFeed(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    platforms: List[str] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)
    time_range: Optional[str] = None
    sort_by: str = "date"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomFeedCreate(BaseModel):
    name: str
    platforms: List[str] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)
    time_range: Optional[str] = None
    sort_by: str = "date"

class NotificationPreferences(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email_notifications: bool = True
    push_notifications: bool = False
    trending_alerts: bool = True
    favorite_creator_updates: bool = True
    daily_digest: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationPreferencesUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    trending_alerts: Optional[bool] = None
    favorite_creator_updates: Optional[bool] = None
    daily_digest: Optional[bool] = None
