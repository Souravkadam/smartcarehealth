import AdminSidebar from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Hospital } from "@/data/hospitals";
import { fetchHospitals, fetchAllPayments, fetchUsers, IPayment, ApiUser } from "@/lib/api";
import { useUserContext } from "@/contexts/UserContext";
import {
  Building2, Stethoscope, Package, Users,
  TrendingUp, Star, IndianRupee, Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area,
} from "recharts";

const COLORS = ["#0d9488", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#10b981"];

function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default function AdminDashboard() {
  const { token } = useUserContext();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);

  useEffect(() => {
    fetchHospitals().then(setHospitals).catch(console.error);
    fetchUsers().then(setUsers).catch(console.error);
    if (token) fetchAllPayments(token).then(setPayments).catch(console.error);
  }, [token]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalDoctors   = hospitals.reduce((s, h) => s + h.doctors.length, 0);
  const totalServices  = hospitals.reduce((s, h) => s + h.services.length, 0);
  const totalRevenue   = payments.filter(p => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);
  const avgRating      = hospitals.length
    ? (hospitals.reduce((s, h) => s + h.rating, 0) / hospitals.length).toFixed(1)
    : "0.0";

  // ── Chart data ─────────────────────────────────────────────────────────────

  // 1. Hospital level distribution (Pie)
  const levelData = ["Premium", "Standard", "Basic"].map(level => ({
    name: level,
    value: hospitals.filter(h => h.level === level).length,
  })).filter(d => d.value > 0);

  // 2. Top 8 hospitals by beds (Bar)
  const bedData = [...hospitals]
    .sort((a, b) => b.beds - a.beds)
    .slice(0, 8)
    .map(h => ({
      name: h.name.split(" ").slice(0, 2).join(" "),
      beds: h.beds,
      icu: h.icuBeds,
    }));

  // 3. Payment status distribution (Pie)
  const paymentPieData = [
    { name: "Success",  value: payments.filter(p => p.status === "SUCCESS").length },
    { name: "Failed",   value: payments.filter(p => p.status === "FAILED").length },
    { name: "Pending",  value: payments.filter(p => p.status === "CREATED").length },
  ].filter(d => d.value > 0);

  // 4. Revenue by day — last 7 days (Area)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const rev = payments
      .filter(p => p.status === "SUCCESS" && p.createdAt.slice(0, 10) === key)
      .reduce((s, p) => s + p.amount / 100, 0);
    return { date: label, revenue: rev };
  });

  // 5. Specialties distribution (Bar)
  const specialtyCount: Record<string, number> = {};
  hospitals.forEach(h => h.specialties.forEach(s => {
    specialtyCount[s] = (specialtyCount[s] || 0) + 1;
  }));
  const specialtyData = Object.entries(specialtyCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.split(" ")[0], count }));

  // 6. User join trend — by month
  const monthCount: Record<string, number> = {};
  users.forEach(u => {
    const m = new Date(u.joinDate).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    monthCount[m] = (monthCount[m] || 0) + 1;
  });
  const userTrendData = Object.entries(monthCount).map(([month, count]) => ({ month, count }));

  const stats = [
    { title: "Total Hospitals", value: hospitals.length,  icon: Building2,    color: "bg-blue-100 text-blue-600",   href: "/admin/hospitals" },
    { title: "Total Doctors",   value: totalDoctors,      icon: Stethoscope,  color: "bg-green-100 text-green-600", href: "/admin/doctors" },
    { title: "Total Services",  value: totalServices,     icon: Package,      color: "bg-purple-100 text-purple-600", href: "/admin/services" },
    { title: "Registered Users",value: users.length,      icon: Users,        color: "bg-orange-100 text-orange-600", href: "/admin/users" },
    { title: "Total Revenue",   value: rupees(totalRevenue), icon: IndianRupee, color: "bg-teal-100 text-teal-600",  href: "/admin/payments" },
    { title: "Appointments",    value: payments.length,   icon: Calendar,     color: "bg-pink-100 text-pink-600",   href: "/admin/appointments" },
  ];

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="p-4 md:p-8">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome to SmartCare Admin Portal</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {stats.map(stat => {
                const Icon = stat.icon;
                return (
                  <Link key={stat.href} href={stat.href}>
                    <button className="card-healthcare p-4 hover:shadow-lg transition-all cursor-pointer w-full text-left group">
                      <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-1">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{stat.value}</p>
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* Row 1: Revenue Area + Payment Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Revenue last 7 days */}
              <div className="lg:col-span-2 card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Revenue — Last 7 Days</h2>
                <p className="text-sm text-gray-400 mb-4">Daily revenue from successful payments</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={last7}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Payment status pie */}
              <div className="card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Payment Status</h2>
                <p className="text-sm text-gray-400 mb-4">Distribution of all transactions</p>
                {paymentPieData.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">No payments yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={paymentPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        dataKey="value" paddingAngle={3}>
                        {paymentPieData.map((_, i) => (
                          <Cell key={i} fill={["#10b981","#ef4444","#f59e0b"][i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Row 2: Beds Bar + Hospital Level Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Beds by hospital */}
              <div className="lg:col-span-2 card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Hospital Capacity</h2>
                <p className="text-sm text-gray-400 mb-4">Total beds vs ICU beds per hospital</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={bedData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend iconType="square" iconSize={10} />
                    <Bar dataKey="beds" name="Total Beds" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="icu"  name="ICU Beds"   fill="#0d9488" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Hospital level pie */}
              <div className="card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Hospital Levels</h2>
                <p className="text-sm text-gray-400 mb-4">Premium / Standard / Basic split</p>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={levelData} cx="50%" cy="50%" outerRadius={85}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {levelData.map((_, i) => (
                        <Cell key={i} fill={["#3b82f6","#10b981","#6b7280"][i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 3: Specialties Bar + User Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Specialties */}
              <div className="card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Top Specialties</h2>
                <p className="text-sm text-gray-400 mb-4">Number of hospitals per specialty</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={specialtyData} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip />
                    <Bar dataKey="count" name="Hospitals" fill="#8b5cf6" radius={[0,4,4,0]}>
                      {specialtyData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User join trend */}
              <div className="card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">User Registrations</h2>
                <p className="text-sm text-gray-400 mb-4">New users joined per month</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={userTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name="Users" stroke="#f59e0b"
                      strokeWidth={2} dot={{ r: 4, fill: "#f59e0b" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Row 4: Recent hospitals + platform stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Hospitals</h2>
                <div className="space-y-2">
                  {hospitals.slice(0, 5).map(hospital => (
                    <Link key={hospital.id} href="/admin/hospitals">
                      <button className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors w-full text-left">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded-full ${hospital.level === "Premium" ? "bg-blue-500" : hospital.level === "Standard" ? "bg-green-500" : "bg-gray-400"}`} />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{hospital.name}</p>
                            <p className="text-xs text-gray-500">{hospital.level} · {hospital.beds} beds</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold text-gray-900">{hospital.rating}</span>
                        </div>
                      </button>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="card-healthcare p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Platform Summary</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Avg Rating",  value: avgRating,                                    color: "text-primary" },
                      { label: "Total Beds",  value: hospitals.reduce((s,h)=>s+h.beds,0),          color: "text-blue-600" },
                      { label: "ICU Beds",    value: hospitals.reduce((s,h)=>s+h.icuBeds,0),       color: "text-teal-600" },
                      { label: "Total OTs",   value: hospitals.reduce((s,h)=>s+h.ots,0),           color: "text-purple-600" },
                      { label: "Revenue",     value: rupees(totalRevenue),                          color: "text-green-600" },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">{row.label}</span>
                        <span className={`font-bold text-lg ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-healthcare p-5 bg-gradient-to-br from-primary/10 to-accent/10">
                  <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { href: "/admin/hospitals",    label: "Add Hospital",    bg: "bg-primary" },
                      { href: "/admin/doctors",      label: "Add Doctor",      bg: "bg-teal-600" },
                      { href: "/admin/appointments", label: "View Appointments", bg: "bg-purple-600" },
                    ].map(a => (
                      <Link key={a.href} href={a.href}>
                        <a className={`block px-4 py-2 ${a.bg} text-white rounded-lg text-center text-sm font-semibold hover:opacity-90 transition-opacity`}>
                          {a.label}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
