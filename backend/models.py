from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
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
