import { Hospital } from "@/data/hospitals";
import { getHospitalImage } from "@/data/images";
import { formatDistance, formatPrice } from "@/lib/utils";
import { useHospitalContext } from "@/contexts/HospitalContext";
import {
  Bed,
  Heart,
  MapPin,
  Phone,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import StarRating from "./StarRating";

interface HospitalCardProps {
  hospital: Hospital;
  variant?: "grid" | "list";
}

export default function HospitalCard({
  hospital,
  variant = "grid",
}: HospitalCardProps) {
  const { addToCompare, removeFromCompare, isInCompare, canAddToCompare } =
    useHospitalContext();

  const handleCompare = () => {
    if (isInCompare(hospital.id)) {
      removeFromCompare(hospital.id);
    } else if (canAddToCompare()) {
      addToCompare(hospital);
    }
  };

  const levelColors = {
    Premium: "bg-blue-50 text-blue-700 border-blue-200",
    Standard: "bg-green-50 text-green-700 border-green-200",
    Basic: "bg-gray-50 text-gray-700 border-gray-200",
  };

  if (variant === "list") {
    return (
      <div className="card-healthcare p-6 flex flex-col md:flex-row gap-6 hover-lift">
        {/* Hospital Image */}
        <div className="md:w-48 h-40 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={getHospitalImage(hospital.name)}
            alt={hospital.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80&fit=crop"; }}
          />
        </div>

        {/* Hospital Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Link href={`/hospital/${hospital.id}`}>
                <a className="text-xl font-bold text-gray-900 hover:text-primary transition-colors">
                  {hospital.name}
                </a>
              </Link>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                {hospital.address}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                levelColors[hospital.level]
              }`}
            >
              {hospital.level}
            </span>
          </div>

          {/* Rating and Distance */}
          <div className="flex items-center gap-6 mb-4">
            <StarRating rating={hospital.rating} reviews={hospital.reviews} />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {formatDistance(hospital.distance)}
            </div>
          </div>

          {/* Facilities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {hospital.facilities.slice(0, 3).map((facility) => (
              <span
                key={facility}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {facility}
              </span>
            ))}
            {hospital.facilities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                +{hospital.facilities.length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              {hospital.beds} beds
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {hospital.icuBeds} ICU
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {hospital.ots} OTs
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/hospital/${hospital.id}`}>
              <Button variant="outline" className="w-full" asChild>
                <span>View Details</span>
              </Button>
            </Link>
            <Button
              variant={isInCompare(hospital.id) ? "default" : "outline"}
              className={`flex-1 ${
                isInCompare(hospital.id)
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : ""
              }`}
              onClick={handleCompare}
              disabled={!canAddToCompare() && !isInCompare(hospital.id)}
            >
              <Heart
                className={`w-4 h-4 mr-2 ${
                  isInCompare(hospital.id) ? "fill-current" : ""
                }`}
              />
              {isInCompare(hospital.id) ? "Remove" : "Compare"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="card-healthcare overflow-hidden hover-lift flex flex-col h-full">
      {/* Hospital Image */}
      <div className="h-44 bg-gray-100 overflow-hidden">
        <img
          src={getHospitalImage(hospital.name)}
          alt={hospital.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80&fit=crop"; }}
        />
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <Link href={`/hospital/${hospital.id}`}>
              <a className="text-lg font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                {hospital.name}
              </a>
            </Link>
            <span
              className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold border ${
                levelColors[hospital.level]
              }`}
            >
              {hospital.level}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{hospital.address}</span>
        </div>

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={hospital.rating} reviews={hospital.reviews} />
        </div>

        {/* Distance */}
        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          {formatDistance(hospital.distance)}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="font-bold text-primary">{hospital.beds}</div>
            <div className="text-xs text-gray-600">Beds</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="font-bold text-primary">{hospital.icuBeds}</div>
            <div className="text-xs text-gray-600">ICU</div>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <div className="font-bold text-primary">{hospital.ots}</div>
            <div className="text-xs text-gray-600">OTs</div>
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-4 flex-1">
          <div className="flex flex-wrap gap-1">
            {hospital.specialties.slice(0, 2).map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium"
              >
                {specialty}
              </span>
            ))}
            {hospital.specialties.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                +{hospital.specialties.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Link href={`/hospital/${hospital.id}`}>
            <Button variant="outline" className="w-full text-sm" asChild>
              <span>Details</span>
            </Button>
          </Link>
          <Button
            variant={isInCompare(hospital.id) ? "default" : "outline"}
            className={`flex-1 text-sm ${
              isInCompare(hospital.id)
                ? "bg-primary hover:bg-primary/90 text-white"
                : ""
            }`}
            onClick={handleCompare}
            disabled={!canAddToCompare() && !isInCompare(hospital.id)}
          >
            <Heart
              className={`w-4 h-4 ${
                isInCompare(hospital.id) ? "fill-current" : ""
              }`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
