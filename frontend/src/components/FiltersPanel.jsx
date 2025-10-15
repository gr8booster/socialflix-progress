import React, { useState } from 'react';
import { Filter, X, Save, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const FiltersPanel = ({ onApplyFilters, onSaveFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [timeRange, setTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const platforms = [
    { id: 'reddit', name: 'Reddit', color: '#FF4500' },
    { id: 'youtube', name: 'YouTube', color: '#FF0000' },
    { id: 'twitter', name: 'Twitter', color: '#1DA1F2' },
    { id: 'instagram', name: 'Instagram', color: '#E4405F' },
    { id: 'tiktok', name: 'TikTok', color: '#000000' },
    { id: 'facebook', name: 'Facebook', color: '#1877F2' },
    { id: 'threads', name: 'Threads', color: '#000000' },
    { id: 'snapchat', name: 'Snapchat', color: '#FFFC00' },
    { id: 'pinterest', name: 'Pinterest', color: '#E60023' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
  ];

  const categories = [
    { id: 'viral', name: 'Viral' },
    { id: 'trending', name: 'Trending' },
    { id: 'most-liked', name: 'Most Liked' },
  ];

  const handleTogglePlatform = (platformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleToggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApply = () => {
    onApplyFilters({
      platforms: selectedPlatforms,
      categories: selectedCategories,
      timeRange,
      sortBy,
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedPlatforms([]);
    setSelectedCategories([]);
    setTimeRange('all');
    setSortBy('date');
    onApplyFilters({
      platforms: [],
      categories: [],
      timeRange: 'all',
      sortBy: 'date',
    });
  };

  const handleSave = () => {
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
      onSaveFilter({
        name: filterName,
        platforms: selectedPlatforms,
        categories: selectedCategories,
        timeRange,
        sortBy,
      });
    }
  };

  const activeFiltersCount = selectedPlatforms.length + selectedCategories.length + 
    (timeRange !== 'all' ? 1 : 0) + (sortBy !== 'date' ? 1 : 0);

  const handleButtonClick = () => {
    console.log('Filters button clicked, current isOpen:', isOpen);
    setIsOpen(!isOpen);
    console.log('Setting isOpen to:', !isOpen);
  };

  console.log('FiltersPanel render, isOpen:', isOpen);

  return (
    <>
      {/* Filter Button */}
      <Button
        onClick={handleButtonClick}
        className="bg-gray-800 hover:bg-gray-700 border border-gray-700 relative"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
          <Card className="bg-gray-900 border-gray-800 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Filter className="w-6 h-6" />
                  Advanced Filters
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Platforms */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Platforms</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {platforms.map((platform) => (
                    <label
                      key={platform.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-red-600 bg-red-600/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={() => handleTogglePlatform(platform.id)}
                      />
                      <span className="text-white text-sm font-medium">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Categories</h3>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCategories.includes(category.id)
                          ? 'border-red-600 bg-red-600/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleToggleCategory(category.id)}
                      />
                      <span className="text-white text-sm font-medium">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Range & Sort */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-white font-semibold mb-3">Time Range</h3>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-3">Sort By</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Most Recent</SelectItem>
                      <SelectItem value="likes">Most Liked</SelectItem>
                      <SelectItem value="comments">Most Commented</SelectItem>
                      <SelectItem value="engagement">Most Engaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:text-white"
                >
                  Clear All
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className="border-gray-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Filter
                  </Button>
                  <Button
                    onClick={handleApply}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default FiltersPanel;
