import Navbar from "@/components/Navbar";
import { useUserContext } from "@/contexts/UserContext";
import { fetchMyAppointments, IAppointment } from "@/lib/api";
import { Calendar, Clock, Stethoscope, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

export default function MyAppointments() {
  const { token, isLoggedIn } = useUserContext();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchMyAppointments(token)
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please login to view appointments</h1>
          <Link href="/login"><a><Button className="bg-primary text-white">Login</Button></a></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-8 border-b border-gray-200">
        <div className="container">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">{appointments.length} appointment{appointments.length !== 1 ? "s" : ""}</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container max-w-3xl">
          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="card-healthcare p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-500 mb-6">Book your first appointment from a hospital page.</p>
              <Link href="/hospitals"><a><Button className="bg-primary text-white">Find Hospitals</Button></a></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt._id} className="card-healthcare p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        <span className="font-bold text-gray-900">{apt.doctorName}</span>
                        <span className="text-sm text-gray-500">· {apt.doctorSpecialty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        {apt.hospitalName}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[apt.status]}`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      {apt.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-primary" />
                      {apt.time}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium">Reason:</span> {apt.reason}
                  </p>

                  {apt.notes && (
                    <p className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2 mt-2">
                      <span className="font-medium">Doctor's note:</span> {apt.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
