import { Doctor } from "@/data/hospitals";
import { getDoctorImage } from "@/data/images";
import { formatPrice } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { Button } from "./ui/button";
import StarRating from "./StarRating";

interface DoctorCardProps {
  doctor: Doctor;
  index?: number;
  onBook?: () => void;
}

export default function DoctorCard({ doctor, index = 0, onBook }: DoctorCardProps) {
  const imgUrl = getDoctorImage(index);

  return (
    <div className="card-healthcare overflow-hidden hover-lift">
      {/* Doctor Image Banner */}
      <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
        <img
          src={imgUrl}
          alt={doctor.name}
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="p-5">
        {/* Doctor Header */}
        <div className="flex items-start gap-3 mb-4 -mt-8 relative">
          <div className="w-14 h-14 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white flex-shrink-0">
            <img
              src={imgUrl}
              alt={doctor.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                el.parentElement!.innerHTML = `<div class="w-full h-full bg-primary/10 flex items-center justify-center"><span class="text-primary font-bold text-lg">${doctor.name.charAt(0)}</span></div>`;
              }}
            />
          </div>
          <div className="pt-8">
            <h3 className="font-bold text-gray-900">{doctor.name}</h3>
            <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
            <p className="text-xs text-gray-500">{doctor.experience} yrs experience</p>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-3">
          <StarRating rating={doctor.rating} showCount={true} size="sm" />
        </div>

        {/* Availability */}
        <div className="mb-3 p-2.5 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs">{doctor.availability}</span>
          </div>
        </div>

        {/* Consultation Fee */}
        <div className="mb-4 flex items-center justify-between p-2.5 bg-primary/5 rounded-lg">
          <span className="text-xs text-gray-500">Consultation Fee</span>
          <span className="font-bold text-primary">{formatPrice(doctor.consultationFee)}</span>
        </div>

        {/* Book Button */}
        <Button
          onClick={onBook}
          className="w-full bg-primary hover:bg-primary/90 text-white text-sm"
        >
          Book Appointment
        </Button>
      </div>
    </div>
  );
}
