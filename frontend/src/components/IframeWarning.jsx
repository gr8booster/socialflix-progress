import React, { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Button } from './ui/button';

const IframeWarning = () => {
  const [isInIframe, setIsInIframe] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Check if app is running inside an iframe
    if (window.self !== window.top) {
      setIsInIframe(true);
    }
  }, []);

  if (!isInIframe || !showBanner) {
    return null;
  }

  const openInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <ExternalLink className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            <span className="font-bold">Preview Mode:</span> For the best experience and to use Sign in, please open ChyllApp in a new tab.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={openInNewTab}
            size="sm"
            className="bg-white hover:bg-gray-100 text-orange-600 font-semibold whitespace-nowrap"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Open in New Tab
          </Button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white hover:text-gray-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IframeWarning;
