import FiltersPanel from "@/components/FiltersPanel";
import HospitalCard from "@/components/HospitalCard";
import Navbar from "@/components/Navbar";
import { Hospital } from "@/data/hospitals";
import { fetchHospitals } from "@/lib/api";
import {
  filterByDistance,
  filterByFacilities,
  filterByLevel,
  filterByRating,
  filterBySearch,
  sortByAIScore,
  sortByDistance,
  sortByRating,
} from "@/lib/utils";
import { Grid3X3, List, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function HospitalListing() {
  const [location] = useLocation();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState(10);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating");

  // Load hospitals from API
  useEffect(() => {
    fetchHospitals().then((data) => {
      setHospitals(data);
      setFilteredHospitals(data);
    }).catch(console.error);
  }, []);

  // Near Me — sort by distance (hospitals already have distance field)
  const handleNearMe = () => {
    if (nearMeActive) {
      setNearMeActive(false);
      setSortBy("rating");
      return;
    }
    setNearMeLoading(true);
    if (!navigator.geolocation) {
      setSortBy("distance");
      setNearMeActive(true);
      setNearMeLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        // Location granted — sort by distance
        setSortBy("distance");
        setMaxDistance(20);
        setNearMeActive(true);
        setNearMeLoading(false);
      },
      () => {
        // Permission denied — still sort by distance field
        setSortBy("distance");
        setNearMeActive(true);
        setNearMeLoading(false);
      }
    );
  };

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [location]);

  // Apply filters
  useEffect(() => {
    let result = [...hospitals];

    // Apply search
    result = filterBySearch(result, searchQuery);

    // Apply level filter
    result = filterByLevel(result, selectedLevels);

    // Apply facilities filter
    result = filterByFacilities(result, selectedFacilities);

    // Apply distance filter
    result = filterByDistance(result, maxDistance);

    // Apply rating filter
    result = filterByRating(result, minRating);

    // Apply sorting
    if (sortBy === "rating") {
      result = sortByRating(result);
    } else if (sortBy === "distance") {
      result = sortByDistance(result);
    } else if (sortBy === "ai") {
      result = sortByAIScore(result);
    }

    setFilteredHospitals(result);
  }, [
    hospitals,
    searchQuery,
    selectedLevels,
    selectedFacilities,
    maxDistance,
    minRating,
    sortBy,
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-8 border-b border-gray-200">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Find Hospitals</h1>
              <p className="text-gray-600">{filteredHospitals.length} hospitals found</p>
            </div>
            <Button
              onClick={handleNearMe}
              variant={nearMeActive ? "default" : "outline"}
              className={nearMeActive ? "bg-primary text-white" : ""}
              disabled={nearMeLoading}
            >
              {nearMeLoading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Locating...</>
                : <><MapPin className="w-4 h-4 mr-2" />{nearMeActive ? "Near Me ✓" : "Near Me"}</>
              }
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <FiltersPanel
                  onSearchChange={setSearchQuery}
                  onLevelChange={setSelectedLevels}
                  onFacilitiesChange={setSelectedFacilities}
                  onDistanceChange={setMaxDistance}
                  onRatingChange={setMinRating}
                  onSortChange={setSortBy}
                  isOpen={isFilterOpen}
                  onClose={() => setIsFilterOpen(false)}
                  hospitals={hospitals}
                />
              </div>
            </div>

            {/* Hospitals Grid/List */}
            <div className="lg:col-span-3">
              {/* View Toggle & Results */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : ""
                    }
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : ""
                    }
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Showing {filteredHospitals.length} result
                  {filteredHospitals.length !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Empty State */}
              {filteredHospitals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hospitals found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredHospitals.map((hospital) => (
                    <HospitalCard
                      key={hospital.id}
                      hospital={hospital}
                      variant={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
