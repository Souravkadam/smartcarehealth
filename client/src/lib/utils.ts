import { Hospital } from "@/data/hospitals";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price in Indian Rupees
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format distance with km
export function formatDistance(distance: number): string {
  return `${distance.toFixed(1)} km`;
}

// Generate star rating array for display
export function generateStars(rating: number): number[] {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(1);
  }

  if (hasHalfStar) {
    stars.push(0.5);
  }

  while (stars.length < 5) {
    stars.push(0);
  }

  return stars;
}

// Filter hospitals by search query
export function filterBySearch(
  hospitals: Hospital[],
  query: string
): Hospital[] {
  if (!query.trim()) return hospitals;

  const lowerQuery = query.toLowerCase();
  return hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(lowerQuery) ||
      hospital.address.toLowerCase().includes(lowerQuery) ||
      hospital.specialties.some((s) =>
        s.toLowerCase().includes(lowerQuery)
      )
  );
}

// Filter hospitals by level (Premium, Standard, Basic)
export function filterByLevel(
  hospitals: Hospital[],
  levels: string[]
): Hospital[] {
  if (levels.length === 0) return hospitals;
  return hospitals.filter((h) => levels.includes(h.level));
}

// Filter hospitals by facilities
export function filterByFacilities(
  hospitals: Hospital[],
  facilities: string[]
): Hospital[] {
  if (facilities.length === 0) return hospitals;
  return hospitals.filter((h) =>
    facilities.every((f) => h.facilities.includes(f))
  );
}

// Filter hospitals by distance
export function filterByDistance(
  hospitals: Hospital[],
  maxDistance: number
): Hospital[] {
  return hospitals.filter((h) => h.distance <= maxDistance);
}

// Filter hospitals by rating
export function filterByRating(
  hospitals: Hospital[],
  minRating: number
): Hospital[] {
  return hospitals.filter((h) => h.rating >= minRating);
}

// Sort hospitals by rating (descending)
export function sortByRating(hospitals: Hospital[]): Hospital[] {
  return [...hospitals].sort((a, b) => b.rating - a.rating);
}

// Sort hospitals by distance (ascending)
export function sortByDistance(hospitals: Hospital[]): Hospital[] {
  return [...hospitals].sort((a, b) => a.distance - b.distance);
}

// Sort hospitals by AI score (descending)
export function sortByAIScore(hospitals: Hospital[]): Hospital[] {
  return [...hospitals].sort((a, b) => b.aiScore - a.aiScore);
}

// Get top hospitals by rating
export function getTopHospitals(hospitals: Hospital[], count: number = 3) {
  return sortByRating(hospitals).slice(0, count);
}

// Get AI recommended hospitals
export function getAIRecommendations(hospitals: Hospital[], count: number = 3) {
  return sortByAIScore(hospitals).slice(0, count);
}

// Get hospitals by specialty
export function getHospitalsBySpecialty(
  hospitals: Hospital[],
  specialty: string
): Hospital[] {
  return hospitals.filter((h) => h.specialties.includes(specialty));
}

// Get all unique specialties from hospitals
export function getAllSpecialties(hospitals: Hospital[]): string[] {
  const specialties = new Set<string>();
  hospitals.forEach((h) => {
    h.specialties.forEach((s) => specialties.add(s));
  });
  return Array.from(specialties).sort();
}

// Get all unique facilities from hospitals
export function getAllFacilities(hospitals: Hospital[]): string[] {
  const facilities = new Set<string>();
  hospitals.forEach((h) => {
    h.facilities.forEach((f) => facilities.add(f));
  });
  return Array.from(facilities).sort();
}

// Calculate average cost for a service across hospitals
export function getAverageServiceCost(
  hospitals: Hospital[],
  serviceName: string
): number {
  const prices = hospitals
    .map((h) => h.services.find((s) => s.name === serviceName)?.basePrice)
    .filter((p) => p !== undefined) as number[];

  if (prices.length === 0) return 0;
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}

// Find cheapest hospital for a service
export function getCheapestHospitalForService(
  hospitals: Hospital[],
  serviceName: string
): Hospital | null {
  let cheapest: Hospital | null = null;
  let minPrice = Infinity;

  hospitals.forEach((h) => {
    const service = h.services.find((s) => s.name === serviceName);
    if (service && service.basePrice < minPrice) {
      minPrice = service.basePrice;
      cheapest = h;
    }
  });

  return cheapest;
}

// Find best rated hospital for a service
export function getBestRatedHospitalForService(
  hospitals: Hospital[],
  serviceName: string
): Hospital | null {
  let bestRated: Hospital | null = null;
  let maxRating = 0;

  hospitals.forEach((h) => {
    const service = h.services.find((s) => s.name === serviceName);
    if (service && h.rating > maxRating) {
      maxRating = h.rating;
      bestRated = h;
    }
  });

  return bestRated;
}

// Get service from hospital
export function getServiceFromHospital(
  hospital: Hospital,
  serviceName: string
) {
  return hospital.services.find((s) => s.name === serviceName);
}

// Calculate total cost for treatment with stay
export function calculateTreatmentCost(
  servicePrice: number,
  estimatedStay: number,
  dailyCharges: number = 5000
): number {
  return servicePrice + estimatedStay * dailyCharges;
}
