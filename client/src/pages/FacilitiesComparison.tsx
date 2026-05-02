import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Hospital } from "@/data/hospitals";
import { fetchHospitals } from "@/lib/api";
import { getAllFacilities } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function FacilitiesComparison() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);

  useEffect(() => {
    fetchHospitals().then(setHospitals).catch(console.error);
  }, []);

  const allFacilities = getAllFacilities(hospitals);

  const toggleHospital = (hospitalId: string) => {
    setSelectedHospitals((prev) =>
      prev.includes(hospitalId)
        ? prev.filter((id) => id !== hospitalId)
        : [...prev, hospitalId]
    );
  };

  const selectedHospitalData = hospitals.filter((h) =>
    selectedHospitals.includes(h.id)
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-8 border-b border-gray-200">
        <div className="container">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Facilities Comparison
          </h1>
          <p className="text-gray-600">
            Compare hospital facilities and amenities side by side
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Hospital Selection Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <div className="card-healthcare p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Select Hospitals
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose up to 4 hospitals to compare
                  </p>

                  <div className="space-y-2">
                    {hospitals.map((hospital) => (
                      <label
                        key={hospital.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedHospitals.includes(hospital.id)}
                          onChange={() => toggleHospital(hospital.id)}
                          disabled={
                            selectedHospitals.length >= 4 &&
                            !selectedHospitals.includes(hospital.id)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary mt-1 disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {hospital.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {hospital.level}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {selectedHospitals.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4 text-sm"
                      onClick={() => setSelectedHospitals([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="lg:col-span-3">
              {selectedHospitals.length === 0 ? (
                <div className="card-healthcare p-12 text-center">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select hospitals to compare facilities
                  </h3>
                  <p className="text-gray-600">
                    Choose one or more hospitals from the left to see their facilities
                  </p>
                </div>
              ) : (
                <div className="card-healthcare overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4 px-4 font-bold text-gray-900 min-w-48">
                          Facility
                        </th>
                        {selectedHospitalData.map((hospital) => (
                          <th
                            key={hospital.id}
                            className="text-center py-4 px-4 font-bold text-gray-900 min-w-40"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="text-sm font-bold text-gray-900">
                                {hospital.name}
                              </div>
                              <button
                                onClick={() => toggleHospital(hospital.id)}
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
                      {allFacilities.map((facility) => (
                        <tr
                          key={facility}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4 font-semibold text-gray-900">
                            {facility}
                          </td>
                          {selectedHospitalData.map((hospital) => (
                            <td
                              key={hospital.id}
                              className="py-4 px-4 text-center"
                            >
                              {hospital.facilities.includes(facility) ? (
                                <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                  <Check className="w-5 h-5 text-green-600" />
                                </div>
                              ) : (
                                <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                                  <X className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Hospital Details Summary */}
              {selectedHospitalData.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedHospitalData.map((hospital) => (
                    <div key={hospital.id} className="card-healthcare p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {hospital.name}
                      </h3>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Facilities</span>
                          <span className="font-bold text-primary">
                            {hospital.facilities.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Beds</span>
                          <span className="font-bold text-primary">
                            {hospital.beds}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ICU Beds</span>
                          <span className="font-bold text-primary">
                            {hospital.icuBeds}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Operation Theaters</span>
                          <span className="font-bold text-primary">
                            {hospital.ots}
                          </span>
                        </div>
                      </div>

                      <Link href={`/hospital/${hospital.id}`}>
                        <a>
                          <Button variant="outline" className="w-full">
                            View Full Details
                          </Button>
                        </a>
                      </Link>
                    </div>
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
