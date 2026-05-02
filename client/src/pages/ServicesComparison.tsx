import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Hospital, Service } from "@/data/hospitals";
import { fetchHospitals } from "@/lib/api";
import {
  calculateTreatmentCost,
  formatPrice,
  getServiceFromHospital,
} from "@/lib/utils";
import { Check, X, TrendingDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function ServicesComparison() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
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

  const toggleService = (service: Service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service]
    );
  };

  const getServiceComparison = (service: Service) => {
    return hospitals
      .map((hospital) => {
        const hospitalService = getServiceFromHospital(hospital, service.name);
        if (!hospitalService) return null;

        const totalCost = calculateTreatmentCost(
          hospitalService.basePrice,
          hospitalService.estimatedStay,
          dailyCharges
        );

        return {
          hospital,
          service: hospitalService,
          totalCost,
          basePrice: hospitalService.basePrice,
          estimatedStay: hospitalService.estimatedStay,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => (a?.totalCost || 0) - (b?.totalCost || 0));
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-8 border-b border-gray-200">
        <div className="container">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Services Comparison
          </h1>
          <p className="text-gray-600">
            Compare services and pricing across multiple hospitals
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Service Selection Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <div className="card-healthcare p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Select Services
                  </h2>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allServices.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.some(
                            (s) => s.id === service.id
                          )}
                          onChange={() => toggleService(service)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {service.category}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {selectedServices.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full mt-4 text-sm"
                      onClick={() => setSelectedServices([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Daily Charges */}
                <div className="card-healthcare p-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Daily Charges
                  </h3>
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">
                      {formatPrice(dailyCharges)} per day
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="15000"
                      step="500"
                      value={dailyCharges}
                      onChange={(e) => setDailyCharges(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Results */}
            <div className="lg:col-span-3">
              {selectedServices.length === 0 ? (
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
                    Select services to compare
                  </h3>
                  <p className="text-gray-600">
                    Choose one or more services from the left to see hospital-wise pricing
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {selectedServices.map((service) => {
                    const comparison = getServiceComparison(service);
                    const cheapest = comparison[0];
                    const mostExpensive = comparison[comparison.length - 1];

                    return (
                      <div key={service.id} className="card-healthcare p-6">
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{service.category}</span>
                            <span>•</span>
                            <span>Est. Stay: {service.estimatedStay} day(s)</span>
                            <span>•</span>
                            <span>Base Price: {formatPrice(service.basePrice)}</span>
                          </div>
                        </div>

                        {/* Comparison Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-4 font-bold text-gray-900">
                                  Hospital
                                </th>
                                <th className="text-right py-3 px-4 font-bold text-gray-900">
                                  Base Price
                                </th>
                                <th className="text-right py-3 px-4 font-bold text-gray-900">
                                  Stay Charges
                                </th>
                                <th className="text-right py-3 px-4 font-bold text-gray-900">
                                  Total Cost
                                </th>
                                <th className="text-center py-3 px-4 font-bold text-gray-900">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {comparison.map((item, index) => (
                                <tr
                                  key={item?.hospital.id}
                                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                    index === 0 ? "bg-accent/5" : ""
                                  }`}
                                >
                                  <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                      <div className="font-semibold text-gray-900">
                                        {item?.hospital.name}
                                      </div>
                                      {index === 0 && (
                                        <span className="px-2 py-1 bg-accent text-white text-xs font-bold rounded-full">
                                          Cheapest
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-right font-semibold text-gray-900">
                                    {formatPrice(item?.basePrice || 0)}
                                  </td>
                                  <td className="py-4 px-4 text-right text-gray-700">
                                    {formatPrice(
                                      (item?.estimatedStay || 0) * dailyCharges
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <div className="text-xl font-bold text-primary">
                                      {formatPrice(item?.totalCost || 0)}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <Link href={`/hospital/${item?.hospital.id}`}>
                                      <a>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                        >
                                          View
                                        </Button>
                                      </a>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Savings Info */}
                        {comparison.length > 1 && (
                          <div className="mt-4 p-4 bg-accent/5 border border-accent/20 rounded-lg flex items-start gap-3">
                            <TrendingDown className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                Potential Savings
                              </div>
                              <div className="text-sm text-gray-700 mt-1">
                                Save{" "}
                                <span className="font-bold text-accent">
                                  {formatPrice(
                                    (mostExpensive?.totalCost || 0) -
                                      (cheapest?.totalCost || 0)
                                  )}
                                </span>{" "}
                                by choosing the cheapest option
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
