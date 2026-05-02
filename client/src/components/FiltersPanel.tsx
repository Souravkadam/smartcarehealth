import { getAllFacilities } from "@/lib/utils";
import { Hospital } from "@/data/hospitals";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface FiltersPanelProps {
  onSearchChange: (query: string) => void;
  onLevelChange: (levels: string[]) => void;
  onFacilitiesChange: (facilities: string[]) => void;
  onDistanceChange: (distance: number) => void;
  onRatingChange: (rating: number) => void;
  onSortChange: (sort: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  hospitals?: Hospital[];
}

export default function FiltersPanel({
  onSearchChange,
  onLevelChange,
  onFacilitiesChange,
  onDistanceChange,
  onRatingChange,
  onSortChange,
  isOpen = true,
  onClose,
  hospitals = [],
}: FiltersPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [distance, setDistance] = useState(10);
  const [rating, setRating] = useState(0);
  const [sort, setSort] = useState("rating");
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    level: true,
    facilities: false,
    distance: true,
    rating: true,
    sort: true,
  });

  const allFacilities = getAllFacilities(hospitals);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  const handleLevelChange = (level: string) => {
    const updated = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    setSelectedLevels(updated);
    onLevelChange(updated);
  };

  const handleFacilityChange = (facility: string) => {
    const updated = selectedFacilities.includes(facility)
      ? selectedFacilities.filter((f) => f !== facility)
      : [...selectedFacilities, facility];
    setSelectedFacilities(updated);
    onFacilitiesChange(updated);
  };

  const handleDistanceChange = (value: number) => {
    setDistance(value);
    onDistanceChange(value);
  };

  const handleRatingChange = (value: number) => {
    setRating(value);
    onRatingChange(value);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange(value);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLevels([]);
    setSelectedFacilities([]);
    setDistance(10);
    setRating(0);
    setSort("rating");
    onSearchChange("");
    onLevelChange([]);
    onFacilitiesChange([]);
    onDistanceChange(10);
    onRatingChange(0);
    onSortChange("rating");
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${
        !isOpen && "hidden"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-gray-600 hover:text-gray-900"
          >
            Reset
          </Button>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("search")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-gray-900">Search</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.search ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.search && (
          <input
            type="text"
            placeholder="Hospital name, specialty..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        )}
      </div>

      {/* Hospital Level */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("level")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-gray-900">Hospital Level</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.level ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.level && (
          <div className="space-y-2">
            {["Premium", "Standard", "Basic"].map((level) => (
              <label key={level} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(level)}
                  onChange={() => handleLevelChange(level)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Facilities */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("facilities")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-gray-900">Facilities</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.facilities ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.facilities && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allFacilities.map((facility) => (
              <label key={facility} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFacilities.includes(facility)}
                  onChange={() => handleFacilityChange(facility)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-gray-700">{facility}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Distance */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("distance")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-gray-900">Distance</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.distance ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.distance && (
          <div>
            <input
              type="range"
              min="1"
              max="20"
              value={distance}
              onChange={(e) => handleDistanceChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-2">
              Up to {distance} km
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-gray-900">Minimum Rating</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.rating ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.rating && (
          <div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={rating}
              onChange={(e) => handleRatingChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-600 mt-2">
              {rating > 0 ? `${rating} stars & above` : "All ratings"}
            </div>
          </div>
        )}
      </div>

      {/* Sort */}
      <div>
        <button
          onClick={() => toggleSection("sort")}
          className="flex items-center justify-between w-full mb-3"
        >
          <h4 className="font-semibold text-gray-900">Sort By</h4>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedSections.sort ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedSections.sort && (
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="rating">Rating (High to Low)</option>
            <option value="distance">Distance (Near to Far)</option>
            <option value="ai">AI Recommendation</option>
          </select>
        )}
      </div>
    </div>
  );
}
