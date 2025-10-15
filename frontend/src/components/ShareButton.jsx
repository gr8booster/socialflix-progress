import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Mail, Link, Check } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from '../hooks/use-toast';

const ShareButton = ({ post, onShare }) => {
  const [copied, setCopied] = useState(false);

  const postUrl = `${window.location.origin}/?post=${post.id}`;
  const shareText = `Check out this ${post.platform} post: ${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}`;

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    onShare?.('twitter');
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    onShare?.('facebook');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied!",
        description: "Post link copied to clipboard",
        duration: 2000,
      });
      onShare?.('copy');
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive"
      });
    }
  };

  const handleShareEmail = () => {
    const subject = `Check out this ${post.platform} post`;
    const body = `${shareText}\n\n${postUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onShare?.('email');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.platform} Post`,
          text: shareText,
          url: postUrl,
        });
        onShare?.('native');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback to copy link if native share not available
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:text-blue-500 transition-all transform hover:scale-110"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Native Share (Mobile) */}
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share...</span>
          </DropdownMenuItem>
        )}
        
        {/* Share to Twitter */}
        <DropdownMenuItem onClick={handleShareTwitter} className="cursor-pointer">
          <Twitter className="mr-2 h-4 w-4 text-blue-400" />
          <span>Share to Twitter</span>
        </DropdownMenuItem>

        {/* Share to Facebook */}
        <DropdownMenuItem onClick={handleShareFacebook} className="cursor-pointer">
          <Facebook className="mr-2 h-4 w-4 text-blue-600" />
          <span>Share to Facebook</span>
        </DropdownMenuItem>

        {/* Copy Link */}
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-green-500">Link Copied!</span>
            </>
          ) : (
            <>
              <Link className="mr-2 h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </DropdownMenuItem>

        {/* Share via Email */}
        <DropdownMenuItem onClick={handleShareEmail} className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          <span>Share via Email</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
