import AdminSidebar from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { fetchAllPayments, IPayment } from "@/lib/api";
import { useUserContext } from "@/contexts/UserContext";
import { IndianRupee, CheckCircle, XCircle, Clock, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const STATUS_STYLE: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700",
  FAILED:  "bg-red-100 text-red-700",
  CREATED: "bg-yellow-100 text-yellow-700",
};

function rupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default function AdminPayments() {
  const { token } = useUserContext();
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = () => {
    if (!token) return;
    setLoading(true);
    fetchAllPayments(token, {
      status: statusFilter !== "all" ? statusFilter : undefined,
      from:   fromDate || undefined,
      to:     toDate   || undefined,
    })
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token, statusFilter, fromDate, toDate]);

  const totalRevenue  = payments.filter(p => p.status === "SUCCESS").reduce((s, p) => s + p.amount, 0);
  const successCount  = payments.filter(p => p.status === "SUCCESS").length;
  const failedCount   = payments.filter(p => p.status === "FAILED").length;
  const pendingCount  = payments.filter(p => p.status === "CREATED").length;

  // Revenue by day — last 14 days
  const revenueByDay = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key   = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const rev   = payments
      .filter(p => p.status === "SUCCESS" && p.createdAt.slice(0, 10) === key)
      .reduce((s, p) => s + p.amount / 100, 0);
    return { date: label, revenue: rev };
  });

  // Payment status pie
  const pieData = [
    { name: "Success", value: successCount, color: "#10b981" },
    { name: "Failed",  value: failedCount,  color: "#ef4444" },
    { name: "Pending", value: pendingCount, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600 mt-1">All Razorpay transactions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="card-healthcare p-5">
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
                <p className="text-2xl font-bold text-primary">{rupees(totalRevenue)}</p>
              </div>
              <div className="card-healthcare p-5">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-gray-500">Successful</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
              <div className="card-healthcare p-5">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-gray-500">Failed</p>
                </div>
                <p className="text-2xl font-bold text-red-500">{failedCount}</p>
              </div>
              <div className="card-healthcare p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue bar chart */}
              <div className="lg:col-span-2 card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Daily Revenue</h2>
                <p className="text-sm text-gray-400 mb-4">Last 14 days of successful payments</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueByDay} barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={1} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                    <Bar dataKey="revenue" name="Revenue" fill="#0d9488" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status pie */}
              <div className="card-healthcare p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Transaction Status</h2>
                <p className="text-sm text-gray-400 mb-4">All-time payment breakdown</p>
                {pieData.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                        dataKey="value" paddingAngle={3}>
                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" iconSize={8} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="card-healthcare p-4 mb-6 flex flex-wrap gap-4 items-end">
              <Filter className="w-4 h-4 text-gray-400 mt-6" />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="all">All</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="CREATED">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">From Date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">To Date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              {(fromDate || toDate || statusFilter !== "all") && (
                <button onClick={() => { setStatusFilter("all"); setFromDate(""); setToDate(""); }}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 underline mt-5">
                  Clear filters
                </button>
              )}
            </div>

            {/* Table */}
            <div className="card-healthcare overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading...</div>
              ) : payments.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No payments found</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      {["Order ID","User","Description","Amount","Status","Payment ID","Date"].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-bold text-gray-900 text-sm">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{p.orderId.slice(-12)}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900 text-sm">{p.userName}</p>
                          <p className="text-xs text-gray-400">{p.userEmail}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{p.description}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{rupees(p.amount)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[p.status]}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-400">
                          {p.paymentId ? p.paymentId.slice(-12) : "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
