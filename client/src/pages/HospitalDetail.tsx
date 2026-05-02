import DoctorCard from "@/components/DoctorCard";
import Navbar from "@/components/Navbar";
import ServiceTable from "@/components/ServiceTable";
import StarRating from "@/components/StarRating";
import TabsComponent from "@/components/TabsComponent";
import BookAppointmentModal from "@/components/BookAppointmentModal";
import { Button } from "@/components/ui/button";
import { fetchHospital } from "@/lib/api";
import { getHospitalImage } from "@/data/images";
import { formatDistance, formatPrice } from "@/lib/utils";
import { useHospitalContext } from "@/contexts/HospitalContext";
import {
  Bed,
  Calendar,
  Clock,
  Heart,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Hospital } from "@/data/hospitals";

export default function HospitalDetail() {
  const [match, params] = useRoute("/hospital/:id");
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare, canAddToCompare } =
    useHospitalContext();

  useEffect(() => {
    if (params?.id) {
      fetchHospital(params.id)
        .then(setHospital)
        .catch(() => setHospital(null));
    }
  }, [params?.id]);

  if (!match || !hospital) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Hospital not found</h1>
        </div>
      </div>
    );
  }

  const handleCompare = () => {
    if (isInCompare(hospital.id)) {
      removeFromCompare(hospital.id);
    } else if (canAddToCompare()) {
      addToCompare(hospital);
    }
  };

  // Tab content components
  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Hospital Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-healthcare p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {hospital.beds}
          </div>
          <div className="text-gray-600">Total Beds</div>
        </div>
        <div className="card-healthcare p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {hospital.icuBeds}
          </div>
          <div className="text-gray-600">ICU Beds</div>
        </div>
        <div className="card-healthcare p-6 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {hospital.ots}
          </div>
          <div className="text-gray-600">Operation Theaters</div>
        </div>
        <div className="card-healthcare p-6 text-center">
          <div className="text-3xl font-bold text-accent mb-2">
            {hospital.doctors.length}
          </div>
          <div className="text-gray-600">Doctors</div>
        </div>
      </div>

      {/* Facilities */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Facilities</h3>
        <div className="flex flex-wrap gap-2">
          {hospital.facilities.map((facility) => (
            <span
              key={facility}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium"
            >
              ✓ {facility}
            </span>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Specialties</h3>
        <div className="flex flex-wrap gap-2">
          {hospital.specialties.map((specialty) => (
            <span
              key={specialty}
              className="px-4 py-2 bg-accent/10 text-accent rounded-lg font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Insurance */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Insurance Accepted
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {hospital.insurance.map((ins) => (
            <div key={ins} className="card-healthcare p-4 text-center">
              <div className="font-semibold text-gray-900 text-sm">{ins}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DoctorsTab = () => (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Expert Doctors ({hospital.doctors.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hospital.doctors.map((doctor, idx) => (
          <DoctorCard key={doctor.id} doctor={doctor} index={idx} onBook={() => setShowBooking(true)} />
        ))}
      </div>
    </div>
  );

  const ServicesTab = () => (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Services & Pricing ({hospital.services.length})
      </h3>
      <ServiceTable services={hospital.services} />
    </div>
  );

  const TimelineTab = () => (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Patient Journey</h3>
      <div className="space-y-6">
        {[
          {
            step: 1,
            title: "Schedule Appointment",
            description: "Book your appointment with our expert doctors",
            icon: Calendar,
          },
          {
            step: 2,
            title: "Pre-Admission",
            description: "Complete pre-admission formalities and tests",
            icon: Stethoscope,
          },
          {
            step: 3,
            title: "Treatment",
            description: "Receive world-class treatment and care",
            icon: Heart,
          },
          {
            step: 4,
            title: "Recovery",
            description: "Post-treatment care and follow-up",
            icon: TrendingUp,
          },
        ].map((item, index) => (
          <div key={index} className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold mb-4">
                {item.step}
              </div>
              {index < 3 && (
                <div className="w-1 h-12 bg-primary/30 mb-4"></div>
              )}
            </div>
            <div className="pb-6">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h4>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReviewsTab = () => (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Patient Reviews ({hospital.reviews})
      </h3>
      <div className="space-y-4">
        {[
          {
            name: "Rajesh Kumar",
            rating: 5,
            text: "Excellent service and professional staff. Highly recommended!",
          },
          {
            name: "Priya Sharma",
            rating: 4.5,
            text: "Great hospital with modern facilities and caring doctors.",
          },
          {
            name: "Amit Patel",
            rating: 5,
            text: "Outstanding experience. The entire team was very supportive.",
          },
        ].map((review, index) => (
          <div key={index} className="card-healthcare p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900">{review.name}</h4>
                <StarRating rating={review.rating} showCount={false} size="sm" />
              </div>
            </div>
            <p className="text-gray-600">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", content: <OverviewTab /> },
    { id: "doctors", label: "Doctors", content: <DoctorsTab /> },
    { id: "services", label: "Services", content: <ServicesTab /> },
    { id: "timeline", label: "Timeline", content: <TimelineTab /> },
    { id: "reviews", label: "Reviews", content: <ReviewsTab /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hospital Header */}
      <section className="border-b border-gray-200">
        {/* Hero Image */}
        <div className="h-56 md:h-72 w-full overflow-hidden relative">
          <img
            src={getHospitalImage(hospital.name)}
            alt={hospital.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&q=80&fit=crop"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              hospital.level === "Premium" ? "bg-blue-500 text-white" :
              hospital.level === "Standard" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
            }`}>{hospital.level}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-accent/5 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {hospital.name}
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCompare}
                disabled={!canAddToCompare() && !isInCompare(hospital.id)}
                className={
                  isInCompare(hospital.id)
                    ? "bg-primary hover:bg-primary/90 text-white border-primary"
                    : ""
                }
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${
                    isInCompare(hospital.id) ? "fill-current" : ""
                  }`}
                />
                {isInCompare(hospital.id) ? "Remove" : "Compare"}
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setShowBooking(true)}>
                Book Appointment
              </Button>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-gray-700">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{hospital.rating}</span>
              <span className="text-gray-600">({hospital.reviews})</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{formatDistance(hospital.distance)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="w-5 h-5 text-primary" />
              <span>{hospital.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5 text-primary" />
              <span>24/7 Available</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <TabsComponent tabs={tabs} />
        </div>
      </section>

      {showBooking && hospital && (
        <BookAppointmentModal hospital={hospital} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}
