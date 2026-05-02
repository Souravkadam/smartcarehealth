import Navbar from "@/components/Navbar";
import { useUserContext } from "@/contexts/UserContext";
import { fetchMyAppointments, IAppointment } from "@/lib/api";
import {
  User, Mail, Phone, Calendar, Clock, Stethoscope,
  Building2, CheckCircle, XCircle, AlertCircle, Star,
  Edit2, Camera, Save, X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG: Record<string, { style: string; icon: any; label: string }> = {
  pending:   { style: "bg-yellow-100 text-yellow-700 border border-yellow-200", icon: AlertCircle, label: "Pending" },
  confirmed: { style: "bg-green-100 text-green-700 border border-green-200",   icon: CheckCircle, label: "Confirmed" },
  cancelled: { style: "bg-red-100 text-red-700 border border-red-200",         icon: XCircle,     label: "Cancelled" },
  completed: { style: "bg-blue-100 text-blue-700 border border-blue-200",      icon: CheckCircle, label: "Completed" },
};

export default function UserProfile() {
  const { user, token, isLoggedIn, updateProfile } = useUserContext();
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  // Edit profile state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editImage, setEditImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchMyAppointments(token).then(setAppointments).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const startEdit = () => {
    setEditName(user?.name || "");
    setEditPhone(user?.phone || "");
    setEditImage(user?.image || "");
    setSaveError("");
    setEditing(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editName.trim()) { setSaveError("Name is required"); return; }
    setSaving(true);
    setSaveError("");
    try {
      await updateProfile({ name: editName.trim(), phone: editPhone.trim(), image: editImage });
      setEditing(false);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container py-20 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Please login to view your profile</h1>
          <Link href="/login"><a><Button className="bg-primary text-white mt-4">Login</Button></a></Link>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const filtered = {
    all: appointments,
    upcoming: appointments.filter(a => a.date >= today && a.status !== "cancelled" && a.status !== "completed"),
    completed: appointments.filter(a => a.status === "completed"),
    cancelled: appointments.filter(a => a.status === "cancelled"),
  };

  const avatarSrc = user?.image || "";
  const avatarFallback = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar with change photo */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/30 shadow-lg bg-white/20">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">{avatarFallback}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors"
                title="Change photo"
              >
                <Camera className="w-4 h-4 text-primary" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (ev) => {
                  const img = ev.target?.result as string;
                  await updateProfile({ image: img });
                };
                reader.readAsDataURL(file);
              }} />
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
              <div className="flex flex-col sm:flex-row gap-3 mt-2 text-white/80 text-sm">
                <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Mail className="w-4 h-4" />{user?.email}
                </span>
                {user?.phone && (
                  <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <Phone className="w-4 h-4" />{user.phone}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Active Patient
                </span>
                <button
                  onClick={startEdit}
                  className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: appointments.length, color: "text-gray-900", bg: "bg-gray-50" },
            { label: "Upcoming", value: filtered.upcoming.length, color: "text-primary", bg: "bg-primary/5" },
            { label: "Completed", value: filtered.completed.length, color: "text-green-600", bg: "bg-green-50" },
            { label: "Cancelled", value: filtered.cancelled.length, color: "text-red-500", bg: "bg-red-50" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-5 ${s.bg} border border-gray-100`}>
              <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile Card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Personal Info
                </h2>
                <button onClick={startEdit} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { icon: User, label: "Full Name", value: user?.name },
                  { icon: Mail, label: "Email", value: user?.email },
                  { icon: Phone, label: "Phone", value: user?.phone || "Not provided" },
                ].map(row => (
                  <div key={row.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <row.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{row.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" /> Quick Actions
              </h2>
              <div className="space-y-1">
                {[
                  { href: "/hospitals", icon: Building2, label: "Find Hospitals" },
                  { href: "/doctor-portal", icon: Stethoscope, label: "Doctor Portal" },
                  { href: "/calculator", icon: Calendar, label: "Cost Calculator" },
                ].map(a => (
                  <Link key={a.href} href={a.href}>
                    <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                      <a.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-primary">{a.label}</span>
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">My Appointments</h2>
              </div>
              <div className="flex border-b border-gray-100 px-6">
                {(["all","upcoming","completed","cancelled"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                      activeTab === tab ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}>
                    {tab} <span className="ml-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{filtered[tab].length}</span>
                  </button>
                ))}
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="py-12 text-center text-gray-400">Loading...</div>
                ) : filtered[activeTab].length === 0 ? (
                  <div className="py-12 text-center">
                    <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No {activeTab} appointments</p>
                    {activeTab === "all" && (
                      <Link href="/hospitals"><a><Button className="bg-primary text-white mt-4 text-sm">Book Appointment</Button></a></Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered[activeTab].map(apt => {
                      const cfg = STATUS_CONFIG[apt.status];
                      const StatusIcon = cfg.icon;
                      return (
                        <div key={apt._id} className="border border-gray-100 rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                <Stethoscope className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{apt.doctorName}</p>
                                <p className="text-xs text-gray-500">{apt.doctorSpecialty}</p>
                              </div>
                            </div>
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.style}`}>
                              <StatusIcon className="w-3 h-3" />{cfg.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Building2 className="w-3.5 h-3.5" />{apt.hospitalName}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" />
                              {new Date(apt.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                            </span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" />{apt.time}</span>
                          </div>
                          <p className="text-xs text-gray-600"><span className="font-semibold">Reason:</span> {apt.reason}</p>
                          {apt.notes && (
                            <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-700">
                              <span className="font-semibold">Doctor's note:</span> {apt.notes}
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
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {saveError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{saveError}</div>}

              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-100">
                    {editImage ? (
                      <img src={editImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-400">{avatarFallback}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <p className="text-xs text-gray-400">Click camera icon to change photo</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Your full name" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="+91 98765 43210" />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email <span className="text-gray-400 font-normal">(cannot change)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                  <input type="email" value={user?.email || ""} disabled
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm cursor-not-allowed" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                <Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
