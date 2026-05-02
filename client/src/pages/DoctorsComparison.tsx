import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Hospital, Doctor } from "@/data/hospitals";
import { fetchHospitals } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Stethoscope, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function DoctorsComparison() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDoctors, setSelectedDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetchHospitals().then(setHospitals).catch(console.error);
  }, []);

  // Get all unique specialties
  const allSpecialties = Array.from(
    new Set(hospitals.flatMap((h) => h.specialties))
  ).sort();

  // Get doctors for selected specialty
  const getDoctorsForSpecialty = (specialty: string) => {
    return hospitals
      .flatMap((hospital) =>
        hospital.doctors
          .filter((d) => d.specialty === specialty)
          .map((d) => ({ ...d, hospitalName: hospital.name, hospitalId: hospital.id }))
      )
      .sort((a, b) => b.rating - a.rating);
  };

  const doctorsForSpecialty = selectedSpecialty
    ? getDoctorsForSpecialty(selectedSpecialty)
    : [];

  const toggleDoctor = (doctor: any) => {
    setSelectedDoctors((prev) =>
      prev.some((d) => d.id === doctor.id)
        ? prev.filter((d) => d.id !== doctor.id)
        : [...prev, doctor]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-8 border-b border-gray-200">
        <div className="container">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctors Comparison
          </h1>
          <p className="text-gray-600">
            Compare doctors by specialty and find the best match for your needs
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Specialty Selection Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <div className="card-healthcare p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Select Specialty
                  </h2>

                  <div className="space-y-2">
                    {allSpecialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => {
                          setSelectedSpecialty(specialty);
                          setSelectedDoctors([]);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                          selectedSpecialty === specialty
                            ? "bg-primary text-white font-semibold"
                            : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                        }`}
                      >
                        <div className="font-semibold">{specialty}</div>
                        <div
                          className={`text-xs mt-1 ${
                            selectedSpecialty === specialty
                              ? "text-primary/80"
                              : "text-gray-600"
                          }`}
                        >
                          {
                            hospitals.flatMap((h) =>
                              h.doctors.filter((d) => d.specialty === specialty)
                            ).length
                          }{" "}
                          doctors
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Doctors List */}
            <div className="lg:col-span-3">
              {!selectedSpecialty ? (
                <div className="card-healthcare p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Stethoscope className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Select a specialty to compare doctors
                  </h3>
                  <p className="text-gray-600">
                    Choose a specialty from the left to see available doctors
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedSpecialty} Specialists
                    </h2>
                    <span className="text-gray-600">
                      {doctorsForSpecialty.length} doctors found
                    </span>
                  </div>

                  {/* Doctors Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {doctorsForSpecialty.map((doctor: any) => (
                      <div
                        key={doctor.id}
                        className={`card-healthcare p-6 hover-lift cursor-pointer transition-all border-2 ${
                          selectedDoctors.some((d) => d.id === doctor.id)
                            ? "border-primary bg-primary/5"
                            : "border-transparent"
                        }`}
                        onClick={() => toggleDoctor(doctor)}
                      >
                        {/* Doctor Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-8 h-8 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">
                              {doctor.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {doctor.specialty}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {doctor.experience} years experience
                            </p>
                          </div>
                        </div>

                        {/* Hospital */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">
                            Hospital
                          </div>
                          <Link href={`/hospital/${doctor.hospitalId}`}>
                            <a className="font-semibold text-primary hover:underline">
                              {doctor.hospitalName}
                            </a>
                          </Link>
                        </div>

                        {/* Rating */}
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                Rating
                              </div>
                              <div className="text-2xl font-bold text-yellow-600">
                                {doctor.rating}
                              </div>
                            </div>
                            <div className="text-3xl">⭐</div>
                          </div>
                        </div>

                        {/* Consultation Fee */}
                        <div className="mb-4 p-3 bg-primary/5 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">
                            Consultation Fee
                          </div>
                          <div className="font-bold text-primary text-lg">
                            {formatPrice(doctor.consultationFee)}
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-primary" />
                            {doctor.availability}
                          </div>
                        </div>

                        {/* Select Button */}
                        <Button
                          className={`w-full ${
                            selectedDoctors.some((d) => d.id === doctor.id)
                              ? "bg-primary hover:bg-primary/90 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                          }`}
                        >
                          {selectedDoctors.some((d) => d.id === doctor.id)
                            ? "✓ Selected"
                            : "Select"}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Comparison Table */}
                  {selectedDoctors.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        Selected Doctors Comparison
                      </h3>

                      <div className="overflow-x-auto card-healthcare">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-4 px-4 font-bold text-gray-900">
                                Doctor
                              </th>
                              <th className="text-center py-4 px-4 font-bold text-gray-900">
                                Experience
                              </th>
                              <th className="text-center py-4 px-4 font-bold text-gray-900">
                                Rating
                              </th>
                              <th className="text-right py-4 px-4 font-bold text-gray-900">
                                Consultation Fee
                              </th>
                              <th className="text-center py-4 px-4 font-bold text-gray-900">
                                Hospital
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDoctors
                              .sort((a, b) => b.rating - a.rating)
                              .map((doctor: any) => (
                                <tr
                                  key={doctor.id}
                                  className="border-b border-gray-100 hover:bg-gray-50"
                                >
                                  <td className="py-4 px-4">
                                    <div className="font-semibold text-gray-900">
                                      {doctor.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {doctor.specialty}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <div className="font-semibold text-gray-900">
                                      {doctor.experience} yrs
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 rounded-full">
                                      <span className="font-bold text-yellow-600">
                                        {doctor.rating}
                                      </span>
                                      <span>⭐</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <div className="font-bold text-primary">
                                      {formatPrice(doctor.consultationFee)}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-center">
                                    <Link href={`/hospital/${doctor.hospitalId}`}>
                                      <a className="text-primary font-semibold hover:underline text-sm">
                                        View
                                      </a>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => setSelectedDoctors([])}
                      >
                        Clear Selection
                      </Button>
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
