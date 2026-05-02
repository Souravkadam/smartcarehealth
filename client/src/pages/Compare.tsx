import Navbar from "@/components/Navbar";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { useHospitalContext } from "@/contexts/HospitalContext";
import { formatDistance, formatPrice } from "@/lib/utils";
import { ArrowRight, Check, X } from "lucide-react";
import { Link } from "wouter";

export default function Compare() {
  const { compareList, removeFromCompare } = useHospitalContext();

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Heart className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No hospitals to compare
          </h1>
          <p className="text-gray-600 mb-6">
            Add hospitals to compare from the hospital listing page
          </p>
          <Link href="/hospitals">
            <a>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Browse Hospitals
              </Button>
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-8 border-b border-gray-200">
        <div className="container">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Compare Hospitals
          </h1>
          <p className="text-gray-600">
            Comparing {compareList.length} hospital{compareList.length !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12">
        <div className="container overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-4 font-bold text-gray-900 min-w-48">
                  Criteria
                </th>
                {compareList.map((hospital) => (
                  <th
                    key={hospital.id}
                    className="text-center py-4 px-4 font-bold text-gray-900 min-w-56"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-lg font-bold text-gray-900">
                        {hospital.name}
                      </div>
                      <button
                        onClick={() => removeFromCompare(hospital.id)}
                        className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Rating */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Rating
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center"
                  >
                    <StarRating rating={hospital.rating} showCount={true} />
                  </td>
                ))}
              </tr>

              {/* Distance */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Distance
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center text-gray-700"
                  >
                    {formatDistance(hospital.distance)}
                  </td>
                ))}
              </tr>

              {/* Hospital Level */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Level
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center"
                  >
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        hospital.level === "Premium"
                          ? "bg-blue-50 text-blue-700"
                          : hospital.level === "Standard"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {hospital.level}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Beds */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Total Beds
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center text-gray-700 font-semibold"
                  >
                    {hospital.beds}
                  </td>
                ))}
              </tr>

              {/* ICU Beds */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  ICU Beds
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center text-gray-700 font-semibold"
                  >
                    {hospital.icuBeds}
                  </td>
                ))}
              </tr>

              {/* Operation Theaters */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Operation Theaters
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center text-gray-700 font-semibold"
                  >
                    {hospital.ots}
                  </td>
                ))}
              </tr>

              {/* Doctors */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Doctors
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center text-gray-700 font-semibold"
                  >
                    {hospital.doctors.length}
                  </td>
                ))}
              </tr>

              {/* AI Score */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  AI Score
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center"
                  >
                    <div className="inline-flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">
                          {hospital.aiScore}
                        </span>
                      </div>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Facilities */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Key Facilities
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center"
                  >
                    <div className="flex flex-wrap gap-1 justify-center">
                      {hospital.facilities.slice(0, 3).map((facility) => (
                        <span
                          key={facility}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {facility}
                        </span>
                      ))}
                      {hospital.facilities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{hospital.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Best For */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Best For
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center"
                  >
                    <div className="space-y-1">
                      {hospital.bestFor.map((item) => (
                        <div key={item} className="text-sm text-gray-700">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Insurance */}
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Insurance Providers
                </td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center"
                  >
                    <div className="text-sm text-gray-700">
                      {hospital.insurance.length} providers
                    </div>
                  </td>
                ))}
              </tr>

              {/* Action */}
              <tr className="bg-primary/5">
                <td className="py-4 px-4"></td>
                {compareList.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="py-4 px-4 text-center"
                  >
                    <Link href={`/hospital/${hospital.id}`}>
                      <a>
                        <Button
                          variant="outline"
                          className="w-full"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

import { Heart } from "lucide-react";
