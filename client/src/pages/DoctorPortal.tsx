import Navbar from "@/components/Navbar";
import { fetchHospitals, fetchDoctorAppointments, IAppointment } from "@/lib/api";
import { Hospital, Doctor } from "@/data/hospitals";
import {
  Calendar, Clock, User, Stethoscope, Star, Building2,
  Phone, CheckCircle, XCircle, AlertCircle, Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";

const STATUS_CONFIG: Record<string, { style: string; icon: any }> = {
  pending:   { style: "bg-yellow-100 text-yellow-700 border border-yellow-200", icon: AlertCircle },
  confirmed: { style: "bg-green-100 text-green-700 border border-green-200",   icon: CheckCircle },
  cancelled: { style: "bg-red-100 text-red-700 border border-red-200",         icon: XCircle },
  completed: { style: "bg-blue-100 text-blue-700 border border-blue-200",      icon: CheckCircle },
};

export default function DoctorPortal() {
  const { token } = useUserContext();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<(Doctor & { hospitalName: string; hospitalId: string }) | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "all">("today");

  useEffect(() => {
    fetchHospitals().then(setHospitals).catch(console.error);
  }, []);

  const allDoctors = hospitals.flatMap(h =>
    h.doctors.map(d => ({ ...d, hospitalName: h.name, hospitalId: h.id }))
  );

  const filteredDoctors = allDoctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.hospitalName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectDoctor = async (doctor: Doctor & { hospitalName: string; hospitalId: string }) => {
    setSelectedDoctor(doctor);
    setLoading(true);
    const t = token || "guest";
    fetchDoctorAppointments(t, doctor.id)
      .then(setAppointments).catch(console.error).finally(() => setLoading(false));
  };

  const today = new Date().toISOString().split("T")[0];
  const tabs = {
    today:    appointments.filter(a => a.date === today),
    upcoming: appointments.filter(a => a.date > today && a.status !== "cancelled"),
    all:      appointments,
  };

  const stats = selectedDoctor ? [
    { label: "Total", value: appointments.length, color: "text-gray-900" },
    { label: "Today", value: tabs.today.length, color: "text-green-600" },
    { label: "Upcoming", value: tabs.upcoming.length, color: "text-primary" },
    { label: "Completed", value: appointments.filter(a => a.status === "completed").length, color: "text-blue-600" },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-gray-200 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Portal</h1>
          <p className="text-gray-500 mt-1">View schedules and appointments for each doctor</p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Doctor List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-20">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3">Doctors</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search doctor..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="divide-y divide-gray-50 max-h-[65vh] overflow-y-auto">
                {filteredDoctors.map(doctor => (
                  <button key={doctor.id} onClick={() => handleSelectDoctor(doctor)}
                    className={`w-full text-left p-4 transition-all hover:bg-gray-50 ${
                      selectedDoctor?.id === doctor.id ? "bg-primary/5 border-l-4 border-primary" : "border-l-4 border-transparent"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                        selectedDoctor?.id === doctor.id ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {doctor.name.split(" ").pop()?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{doctor.name}</p>
                        <p className="text-xs text-primary truncate">{doctor.specialty}</p>
                        <p className="text-xs text-gray-400 truncate">{doctor.hospitalName}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredDoctors.length === 0 && (
                  <div className="p-6 text-center text-gray-400 text-sm">No doctors found</div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedDoctor ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Doctor</h3>
                <p className="text-gray-400 text-sm">Choose a doctor from the list to view their profile and appointments</p>
              </div>
            ) : (
              <>
                {/* Doctor Profile Card */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-2xl font-bold text-white">
                          {selectedDoctor.name.split(" ").pop()?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold">{selectedDoctor.name}</h2>
                        <p className="text-primary/80 text-sm mt-0.5">{selectedDoctor.specialty}</p>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/80">
                          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                            <Building2 className="w-3 h-3" />{selectedDoctor.hospitalName}
                          </span>
                          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                            <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                            {selectedDoctor.rating} Rating
                          </span>
                          <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3" />{selectedDoctor.experience} yrs exp
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold">₹{selectedDoctor.consultationFee}</p>
                        <p className="text-xs text-white/70">Consultation fee</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" />
                      {selectedDoctor.availability}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Appointments */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Appointments</h3>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-100 px-5">
                    {(["today","upcoming","all"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                          activeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}>
                        {tab} <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{tabs[tab].length}</span>
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {loading ? (
                      <div className="py-10 text-center text-gray-400">Loading...</div>
                    ) : tabs[activeTab].length === 0 ? (
                      <div className="py-10 text-center">
                        <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No {activeTab} appointments</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tabs[activeTab].map(apt => {
                          const cfg = STATUS_CONFIG[apt.status];
                          const StatusIcon = cfg.icon;
                          return (
                            <div key={apt._id} className="border border-gray-100 rounded-xl p-4 hover:border-primary/20 hover:shadow-sm transition-all">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <User className="w-4 h-4 text-gray-500" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{apt.userName}</p>
                                    <p className="text-xs text-gray-400">{apt.userEmail}</p>
                                    {apt.userPhone && <p className="text-xs text-gray-400">{apt.userPhone}</p>}
                                  </div>
                                </div>
                                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.style}`}>
                                  <StatusIcon className="w-3 h-3" />{apt.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" />
                                  {new Date(apt.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                                </span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" />{apt.time}</span>
                              </div>
                              <p className="text-xs text-gray-600"><span className="font-semibold">Reason:</span> {apt.reason}</p>
                              {apt.notes && (
                                <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-xs text-blue-700">
                                  <span className="font-semibold">Note:</span> {apt.notes}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
