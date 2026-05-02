import HospitalCard from "@/components/HospitalCard";
import Navbar from "@/components/Navbar";
import { Hospital } from "@/data/hospitals";
import { fetchHospitals } from "@/lib/api";
import {
  getAIRecommendations,
  getTopHospitals,
  getAllSpecialties,
} from "@/lib/utils";
import {
  Activity,
  Briefcase,
  Heart,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    fetchHospitals().then(setHospitals).catch(console.error);
  }, []);

  const topHospitals = getTopHospitals(hospitals, 3);
  const aiRecommendations = getAIRecommendations(hospitals, 3);
  const specialties = getAllSpecialties(hospitals);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/hospitals?search=${encodeURIComponent(
        searchQuery
      )}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-accent/5 py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find & Compare the Best <span className="text-primary">Hospitals</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Search, compare, and book appointments at top hospitals near you.
              Make informed healthcare decisions with confidence.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-2 bg-white rounded-lg shadow-md p-2 border border-gray-200">
                <Search className="w-6 h-6 text-gray-400 ml-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search hospitals, specialties, doctors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-white px-6"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap justify-center gap-3">
              {specialties.slice(0, 5).map((specialty) => (
                <Link key={specialty} href={`/hospitals?search=${specialty}`}>
                  <button className="px-4 py-2 bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer">
                    {specialty}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {hospitals.length}+
              </div>
              <div className="text-gray-600">Hospitals</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                <Stethoscope className="w-8 h-8 text-accent" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {hospitals.reduce((sum, h) => sum + h.doctors.length, 0)}+
              </div>
              <div className="text-gray-600">Expert Doctors</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                50K+
              </div>
              <div className="text-gray-600">Happy Patients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Hospitals Section */}
      <section className="py-16">
        <div className="container">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Top Rated Hospitals
            </h2>
            <p className="text-gray-600">
              Hospitals with the highest patient satisfaction and ratings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {topHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                variant="grid"
              />
            ))}
          </div>

          <div className="text-center">
            <Link href="/hospitals">
              <a>
                <Button className="bg-primary hover:bg-primary/90 text-white px-8">
                  View All Hospitals
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Recommendations Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-gray-900">
                AI Recommended
              </h2>
            </div>
            <p className="text-gray-600">
              Hospitals recommended based on our intelligent matching algorithm
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiRecommendations.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                variant="grid"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose SmartCare?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Search,
                title: "Easy Search & Filter",
                description:
                  "Find hospitals by specialty, location, facilities, and ratings in seconds.",
              },
              {
                icon: Heart,
                title: "Compare Up to 4",
                description:
                  "Side-by-side comparison of hospitals to make the best choice.",
              },
              {
                icon: Briefcase,
                title: "Cost Transparency",
                description:
                  "View and compare treatment costs across multiple hospitals.",
              },
              {
                icon: Stethoscope,
                title: "Expert Doctors",
                description:
                  "Access profiles of experienced doctors with real ratings.",
              },
            ].map((feature, index) => (
              <div key={index} className="card-healthcare p-6 hover-lift">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Perfect Hospital?
            </h2>
            <p className="text-lg text-primary/20 mb-8">
              Start comparing hospitals today and make informed healthcare decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/hospitals">
                <a>
                  <Button className="bg-white text-primary hover:bg-gray-100 px-8">
                    Explore Hospitals
                  </Button>
                </a>
              </Link>
              <Link href="/calculator">
                <a>
                  <Button
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8"
                  >
                    Calculate Costs
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">SmartCare</h3>
              <p className="text-sm">
                Making healthcare accessible and transparent for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/hospitals">
                    <a className="hover:text-white transition-colors">
                      Hospitals
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/calculator">
                    <a className="hover:text-white transition-colors">
                      Cost Calculator
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>
              &copy; 2026 SmartCare. All rights reserved. | Making healthcare
              decisions easier.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
