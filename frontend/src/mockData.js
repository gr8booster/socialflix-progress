// Mock viral social media content for ChyllApp

export const mockViralPosts = [
  // Instagram Posts
  {
    id: '1',
    platform: 'instagram',
    platformColor: '#E1306C',
    user: {
      name: 'National Geographic',
      username: '@natgeo',
      avatar: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=100&h=100&fit=crop'
    },
    content: 'Photo by @paulnicklen | A polar bear peers through the ice in the Arctic. This image reminds us of the fragile beauty of our planet.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800&h=600&fit=crop'
    },
    likes: 2840000,
    comments: 18500,
    shares: 45000,
    timestamp: '2 hours ago',
    category: 'trending'
  },
  {
    id: '2',
    platform: 'instagram',
    platformColor: '#E1306C',
    user: {
      name: 'NASA',
      username: '@nasa',
      avatar: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=100&h=100&fit=crop'
    },
    content: 'Stunning view of Earth from the International Space Station. Our planet is a beautiful blue marble floating in space. 🌍✨',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop'
    },
    likes: 3200000,
    comments: 24000,
    shares: 68000,
    timestamp: '5 hours ago',
    category: 'trending'
  },
  {
    id: '3',
    platform: 'instagram',
    platformColor: '#E1306C',
    user: {
      name: 'The Dodo',
      username: '@thedodo',
      avatar: 'https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=100&h=100&fit=crop'
    },
    content: 'This golden retriever puppy learning to swim is the cutest thing you\'ll see today! 🐕💕',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop'
    },
    likes: 1850000,
    comments: 12300,
    shares: 35000,
    timestamp: '8 hours ago',
    category: 'most-liked'
  },

  // Twitter/X Posts
  {
    id: '4',
    platform: 'twitter',
    platformColor: '#1DA1F2',
    user: {
      name: 'Elon Musk',
      username: '@elonmusk',
      avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=100&h=100&fit=crop'
    },
    content: 'Just spoke with the Starship team. Launch attempt next week! 🚀',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&h=600&fit=crop'
    },
    likes: 890000,
    comments: 45000,
    shares: 125000,
    timestamp: '1 hour ago',
    category: 'trending'
  },
  {
    id: '5',
    platform: 'twitter',
    platformColor: '#1DA1F2',
    user: {
      name: 'MrBeast',
      username: '@MrBeast',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
    },
    content: 'Giving away $100,000 to random followers! Like and retweet to enter. Winner announced in 24 hours! 💰',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=800&h=600&fit=crop'
    },
    likes: 2100000,
    comments: 350000,
    shares: 890000,
    timestamp: '3 hours ago',
    category: 'viral'
  },
  {
    id: '6',
    platform: 'twitter',
    platformColor: '#1DA1F2',
    user: {
      name: 'Neil deGrasse Tyson',
      username: '@neiltyson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    content: 'The Universe is under no obligation to make sense to you. But it\'s fun trying to figure it out anyway.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop'
    },
    likes: 456000,
    comments: 8900,
    shares: 34000,
    timestamp: '6 hours ago',
    category: 'most-liked'
  },

  // TikTok Posts
  {
    id: '7',
    platform: 'tiktok',
    platformColor: '#000000',
    user: {
      name: 'Charli D\'Amelio',
      username: '@charlidamelio',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    content: 'New dance challenge! Who\'s trying this? 💃 #DanceChallenge #Viral',
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&h=600&fit=crop'
    },
    likes: 4200000,
    comments: 125000,
    shares: 890000,
    timestamp: '4 hours ago',
    category: 'viral'
  },
  {
    id: '8',
    platform: 'tiktok',
    platformColor: '#000000',
    user: {
      name: 'Gordon Ramsay',
      username: '@gordonramsayofficial',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop'
    },
    content: 'Rating your cooking videos... This one is RAW! 😱 #Cooking #GordonRamsay',
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop'
    },
    likes: 3100000,
    comments: 89000,
    shares: 450000,
    timestamp: '7 hours ago',
    category: 'trending'
  },
  {
    id: '9',
    platform: 'tiktok',
    platformColor: '#000000',
    user: {
      name: 'Zach King',
      username: '@zachking',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    content: 'Magic trick reveal! Can you guess how I did this? ✨🎩 #Magic #Illusion',
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop'
    },
    likes: 5600000,
    comments: 234000,
    shares: 1200000,
    timestamp: '12 hours ago',
    category: 'viral'
  },

  // YouTube Posts
  {
    id: '10',
    platform: 'youtube',
    platformColor: '#FF0000',
    user: {
      name: 'MrBeast',
      username: '@MrBeast',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop'
    },
    content: 'I Spent 50 Hours in Solitary Confinement',
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=600&fit=crop'
    },
    likes: 8900000,
    comments: 456000,
    shares: 234000,
    timestamp: '1 day ago',
    category: 'viral'
  },
  {
    id: '11',
    platform: 'youtube',
    platformColor: '#FF0000',
    user: {
      name: 'Marques Brownlee',
      username: '@MKBHD',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop'
    },
    content: 'The Truth About AI in 2025 - Everything Changed',
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop'
    },
    likes: 3400000,
    comments: 125000,
    shares: 89000,
    timestamp: '2 days ago',
    category: 'trending'
  },
  {
    id: '12',
    platform: 'youtube',
    platformColor: '#FF0000',
    user: {
      name: 'Veritasium',
      username: '@veritasium',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    content: 'The Bizarre Behavior of Rotating Bodies',
    media: {
      type: 'video',
      url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop'
    },
    likes: 2100000,
    comments: 45000,
    shares: 56000,
    timestamp: '3 days ago',
    category: 'most-liked'
  },

  // Facebook Posts
  {
    id: '13',
    platform: 'facebook',
    platformColor: '#1877F2',
    user: {
      name: 'Tasty',
      username: '@buzzfeedtasty',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    content: '5-Ingredient Chocolate Lava Cake 🍫 Tag someone who needs to try this!',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&h=600&fit=crop'
    },
    likes: 1200000,
    comments: 34000,
    shares: 450000,
    timestamp: '5 hours ago',
    category: 'viral'
  },
  {
    id: '14',
    platform: 'facebook',
    platformColor: '#1877F2',
    user: {
      name: 'Humans of New York',
      username: '@humansofny',
      avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop'
    },
    content: '"I was homeless for 3 years. Today I got the keys to my first apartment." This is the full story...',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop'
    },
    likes: 890000,
    comments: 23000,
    shares: 125000,
    timestamp: '9 hours ago',
    category: 'most-liked'
  },
  {
    id: '15',
    platform: 'facebook',
    platformColor: '#1877F2',
    user: {
      name: 'National Geographic',
      username: '@natgeo',
      avatar: 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=100&h=100&fit=crop'
    },
    content: 'A baby elephant taking its first steps. Nature is incredible! 🐘',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&h=600&fit=crop'
    },
    likes: 2300000,
    comments: 56000,
    shares: 340000,
    timestamp: '14 hours ago',
    category: 'trending'
  },

  // LinkedIn Posts
  {
    id: '16',
    platform: 'linkedin',
    platformColor: '#0A66C2',
    user: {
      name: 'Simon Sinek',
      username: '@simonsinek',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop'
    },
    content: 'Leadership is not about being in charge. It\'s about taking care of those in your charge. Here\'s what I learned...',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop'
    },
    likes: 345000,
    comments: 12000,
    shares: 89000,
    timestamp: '6 hours ago',
    category: 'trending'
  },
  {
    id: '17',
    platform: 'linkedin',
    platformColor: '#0A66C2',
    user: {
      name: 'Bill Gates',
      username: '@billgates',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop'
    },
    content: 'Exciting developments in clean energy technology. The future is bright! Here\'s my take on what\'s coming next...',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop'
    },
    likes: 567000,
    comments: 23000,
    shares: 145000,
    timestamp: '1 day ago',
    category: 'most-liked'
  },
  {
    id: '18',
    platform: 'linkedin',
    platformColor: '#0A66C2',
    user: {
      name: 'Sheryl Sandberg',
      username: '@sherylsandberg',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop'
    },
    content: 'Women in tech are changing the world. Proud to celebrate these achievements and looking forward to more! 💪',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop'
    },
    likes: 234000,
    comments: 8900,
    shares: 67000,
    timestamp: '2 days ago',
    category: 'trending'
  }
];

export const platformInfo = {
  instagram: { name: 'Instagram', color: '#E1306C', icon: '📷' },
  twitter: { name: 'Twitter/X', color: '#1DA1F2', icon: '🐦' },
  tiktok: { name: 'TikTok', color: '#000000', icon: '🎵' },
  youtube: { name: 'YouTube', color: '#FF0000', icon: '▶️' },
  facebook: { name: 'Facebook', color: '#1877F2', icon: '👥' },
  linkedin: { name: 'LinkedIn', color: '#0A66C2', icon: '💼' }
};

export const getPostsByPlatform = (platform) => {
  return mockViralPosts.filter(post => post.platform === platform);
};

export const getPostsByCategory = (category) => {
  return mockViralPosts.filter(post => post.category === category);
};

export const getFeaturedPost = () => {
  return mockViralPosts[8]; // Zach King's magic trick
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};