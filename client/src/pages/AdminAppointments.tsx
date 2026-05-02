import AdminSidebar from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  fetchAllAppointments, updateAppointmentStatus,
  createAdminAppointment, fetchHospitals, IAppointment,
} from "@/lib/api";
import { Hospital } from "@/data/hospitals";
import { useUserContext } from "@/contexts/UserContext";
import { Calendar, CheckCircle, XCircle, Clock, Eye, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
};

const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
  "12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM",
];

const EMPTY_FORM = {
  userName: "", userEmail: "", userPhone: "",
  hospitalId: "", doctorId: "", date: "", time: "", reason: "", status: "confirmed",
};

export default function AdminAppointments() {
  const { token } = useUserContext();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<IAppointment | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetchAllAppointments(token, filter === "all" ? undefined : filter)
      .then(setAppointments).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token, filter]);
  useEffect(() => { fetchHospitals().then(setHospitals).catch(console.error); }, []);

  const selectedHospital = hospitals.find(h => h.id === form.hospitalId);
  const availableDoctors = selectedHospital?.doctors || [];

  const handleStatus = async (id: string, status: string) => {
    if (!token) return;
    await updateAppointmentStatus(token, id, status, notes);
    setSelected(null); setNotes(""); load();
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.hospitalId || !form.doctorId || !form.date || !form.time || !form.reason || !form.userName || !form.userEmail) {
      setFormError("All fields are required"); return;
    }
    setFormLoading(true);
    try {
      await createAdminAppointment(token!, form);
      setShowAdd(false); setForm(EMPTY_FORM); load();
    } catch (err: any) {
      setFormError(err.message || "Failed to create appointment");
    } finally {
      setFormLoading(false);
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                <p className="text-gray-600 mt-1">Manage all patient appointments</p>
              </div>
              <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New Appointment
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total", value: stats.total, color: "text-gray-900" },
                { label: "Pending", value: stats.pending, color: "text-yellow-600" },
                { label: "Confirmed", value: stats.confirmed, color: "text-green-600" },
                { label: "Completed", value: stats.completed, color: "text-blue-600" },
              ].map(s => (
                <div key={s.label} className="card-healthcare p-5">
                  <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["all","pending","confirmed","completed","cancelled"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                    filter === f ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-primary"
                  }`}>{f}</button>
              ))}
            </div>

            {/* Table */}
            <div className="card-healthcare overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading...</div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No appointments found</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      {["Patient","Doctor","Hospital","Date & Time","Status","Actions"].map(h => (
                        <th key={h} className="text-left py-4 px-4 font-bold text-gray-900 text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900 text-sm">{apt.userName}</p>
                          <p className="text-xs text-gray-500">{apt.userEmail}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900 text-sm">{apt.doctorName}</p>
                          <p className="text-xs text-gray-500">{apt.doctorSpecialty}</p>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{apt.hospitalName}</td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-medium text-gray-900">{apt.date}</p>
                          <p className="text-xs text-gray-500">{apt.time}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[apt.status]}`}>{apt.status}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1">
                            <button onClick={() => { setSelected(apt); setNotes(apt.notes || ""); }} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            {apt.status === "pending" && (
                              <>
                                <button onClick={() => handleStatus(apt._id, "confirmed")} className="p-1.5 hover:bg-green-100 text-green-600 rounded-lg" title="Confirm">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleStatus(apt._id, "cancelled")} className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg" title="Cancel">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {apt.status === "confirmed" && (
                              <button onClick={() => handleStatus(apt._id, "completed")} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg" title="Complete">
                                <Clock className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>

        {/* Add Appointment Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Add New Appointment</h2>
                <button onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
                {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>}

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Info</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Patient Name</label>
                    <input type="text" value={form.userName} onChange={e => setForm({...form, userName: e.target.value})}
                      placeholder="Full name" required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Phone</label>
                    <input type="tel" value={form.userPhone} onChange={e => setForm({...form, userPhone: e.target.value})}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Patient Email</label>
                  <input type="email" value={form.userEmail} onChange={e => setForm({...form, userEmail: e.target.value})}
                    placeholder="patient@example.com" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>

                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Appointment Details</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Hospital</label>
                  <select value={form.hospitalId} onChange={e => setForm({...form, hospitalId: e.target.value, doctorId: ""})} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                    <option value="">Select hospital...</option>
                    {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Doctor</label>
                  <select value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} required
                    disabled={!form.hospitalId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm disabled:opacity-50">
                    <option value="">Select doctor...</option>
                    {availableDoctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialty}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Date</label>
                    <input type="date" min={today} value={form.date} onChange={e => setForm({...form, date: e.target.value})} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">Time</label>
                    <select value={form.time} onChange={e => setForm({...form, time: e.target.value})} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                      <option value="">Select time...</option>
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Reason for Visit</label>
                  <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={2} required
                    placeholder="Describe the reason..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={formLoading} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                    {formLoading ? "Creating..." : "Create Appointment"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail / Update Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Appointment Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="space-y-2 text-sm mb-4">
                {[
                  ["Patient", selected.userName],
                  ["Email", selected.userEmail],
                  ["Phone", selected.userPhone],
                  ["Doctor", selected.doctorName],
                  ["Specialty", selected.doctorSpecialty],
                  ["Hospital", selected.hospitalName],
                  ["Date & Time", `${selected.date} ${selected.time}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-900">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[selected.status]}`}>{selected.status}</span>
                </div>
                <div className="pt-1">
                  <p className="text-gray-500 mb-1">Reason</p>
                  <p className="bg-gray-50 rounded p-2 text-gray-900">{selected.reason}</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Note for Patient</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Optional note..." />
              </div>
              <div className="flex gap-2 flex-wrap">
                {selected.status === "pending" && (
                  <>
                    <Button onClick={() => handleStatus(selected._id, "confirmed")} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm">Confirm</Button>
                    <Button onClick={() => handleStatus(selected._id, "cancelled")} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm">Cancel</Button>
                  </>
                )}
                {selected.status === "confirmed" && (
                  <Button onClick={() => handleStatus(selected._id, "completed")} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm">Mark Completed</Button>
                )}
                <Button variant="outline" onClick={() => setSelected(null)} className="flex-1 text-sm">Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
