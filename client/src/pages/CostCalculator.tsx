import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Hospital, Service } from "@/data/hospitals";
import { fetchHospitals } from "@/lib/api";
import {
  calculateTreatmentCost,
  formatPrice,
  getCheapestHospitalForService,
  getBestRatedHospitalForService,
  getServiceFromHospital,
} from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function CostCalculator() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dailyCharges, setDailyCharges] = useState(5000);

  useEffect(() => {
    fetchHospitals().then(setHospitals).catch(console.error);
  }, []);

  // Get all unique services
  const allServices = Array.from(
    new Map(
      hospitals
        .flatMap((h) => h.services)
        .map((s) => [s.name, s])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const getCostComparison = () => {
    if (!selectedService) return [];

    return hospitals
      .map((hospital) => {
        const service = getServiceFromHospital(hospital, selectedService.name);
        if (!service) return null;

        const totalCost = calculateTreatmentCost(
          service.basePrice,
          service.estimatedStay,
          dailyCharges
        );

        return {
          hospital,
          service,
          totalCost,
          basePrice: service.basePrice,
          estimatedStay: service.estimatedStay,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => (a?.totalCost || 0) - (b?.totalCost || 0));
  };

  const costComparison = getCostComparison();
  const cheapest = costComparison[0];
  const bestRated = getBestRatedHospitalForService(
    hospitals,
    selectedService?.name || ""
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-8 border-b border-gray-200">
        <div className="container">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Treatment Cost Calculator
          </h1>
          <p className="text-gray-600">
            Compare treatment costs across hospitals and find the best value
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Selection */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <div className="card-healthcare p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Select Treatment
                  </h2>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                          selectedService?.id === service.id
                            ? "bg-primary text-white font-semibold"
                            : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <div className="font-semibold">{service.name}</div>
                        <div
                          className={`text-xs mt-1 ${
                            selectedService?.id === service.id
                              ? "text-primary/80"
                              : "text-gray-600"
                          }`}
                        >
                          {service.category}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Charges Adjustment */}
                {selectedService && (
                  <div className="card-healthcare p-6 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Daily Charges
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-600 block mb-2">
                          Daily room charges: {formatPrice(dailyCharges)}
                        </label>
                        <input
                          type="range"
                          min="1000"
                          max="15000"
                          step="500"
                          value={dailyCharges}
                          onChange={(e) =>
                            setDailyCharges(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">
                          Estimated stay
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {selectedService.estimatedStay} day(s)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Comparison Results */}
            <div className="lg:col-span-2">
              {!selectedService ? (
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
                    Select a treatment to compare costs
                  </h3>
                  <p className="text-gray-600">
                    Choose from the list on the left to see hospital-wise pricing
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Service Details */}
                  <div className="card-healthcare p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {selectedService.name}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          Base Price
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(selectedService.basePrice)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          Estimated Stay
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {selectedService.estimatedStay} day(s)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hospital Comparison */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Cost Comparison Across Hospitals
                    </h3>
                    <div className="space-y-3">
                      {costComparison.map((item, index) => (
                        <div
                          key={item?.hospital.id}
                          className={`card-healthcare p-6 ${
                            index === 0 ? "ring-2 ring-accent" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg text-gray-900">
                                  {item?.hospital.name}
                                </h4>
                                {index === 0 && (
                                  <span className="px-2 py-1 bg-accent text-white text-xs font-bold rounded-full">
                                    Cheapest
                                  </span>
                                )}
                                {bestRated?.id === item?.hospital.id && (
                                  <span className="px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
                                    Best Rated
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                Rating: {item?.hospital.rating} ⭐
                              </div>
                            </div>
                            {index === 0 && (
                              <TrendingDown className="w-6 h-6 text-accent" />
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                Base Price
                              </div>
                              <div className="font-bold text-gray-900">
                                {formatPrice(item?.basePrice || 0)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                Stay Charges
                              </div>
                              <div className="font-bold text-gray-900">
                                {formatPrice(
                                  (item?.estimatedStay || 0) * dailyCharges
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                Total Cost
                              </div>
                              <div className="text-xl font-bold text-primary">
                                {formatPrice(item?.totalCost || 0)}
                              </div>
                            </div>
                          </div>

                          <Link href={`/hospital/${item?.hospital.id}`}>
                            <a>
                              <Button
                                variant="outline"
                                className="w-full text-sm"
                              >
                                View Hospital Details
                              </Button>
                            </a>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Savings Info */}
                  {costComparison.length > 1 && (
                    <div className="card-healthcare p-6 bg-accent/5 border-accent/20">
                      <div className="flex items-start gap-3">
                        <TrendingDown className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">
                            Potential Savings
                          </h4>
                          <p className="text-gray-700">
                            By choosing the cheapest option, you could save{" "}
                            <span className="font-bold text-accent">
                              {formatPrice(
                                (costComparison[costComparison.length - 1]
                                  ?.totalCost || 0) -
                                  (costComparison[0]?.totalCost || 0)
                              )}
                            </span>{" "}
                            compared to the most expensive option.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
