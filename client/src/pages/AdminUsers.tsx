import AdminSidebar from "@/components/AdminSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { SingleImageUpload } from "@/components/ImageUpload";
import { Trash2, Eye, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchUsers, deleteUser, createUser, ApiUser } from "@/lib/api";

const EMPTY_FORM = { name: "", email: "", phone: "", password: "", status: "Active", image: "" };

export default function AdminUsers() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const load = () => fetchUsers().then(setUsers).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(id);
    setUsers(users.filter((u) => u.id !== id));
    setShowDetails(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (form.password.length < 6) { setFormError("Password must be at least 6 characters"); return; }
    setFormLoading(true);
    try {
      const newUser = await createUser(form);
      setUsers([newUser, ...users]);
      setShowAdd(false);
      setForm(EMPTY_FORM);
    } catch (err: any) {
      setFormError(err.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const totalAppointments = users.reduce((sum, u) => sum + u.appointments, 0);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />

        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-600 mt-1">Manage all registered users</p>
              </div>
              <Button onClick={() => setShowAdd(true)} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New User
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Total Users", value: totalUsers, color: "text-primary" },
                { label: "Active Users", value: activeUsers, color: "text-green-600" },
                { label: "Total Appointments", value: totalAppointments, color: "text-accent" },
              ].map(s => (
                <div key={s.label} className="card-healthcare p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">{s.label}</p>
                  <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="card-healthcare overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    {["Photo", "Name", "Email", "Phone", "Status", "Appointments", "Join Date", "Actions"].map(h => (
                      <th key={h} className="text-left py-4 px-4 font-bold text-gray-900 text-sm">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {(user as any).image ? (
                            <img src={(user as any).image} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{user.email}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{user.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900">{user.appointments}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{new Date(user.joinDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setSelectedUser(user); setShowDetails(true); }} className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="p-12 text-center text-gray-500">No users found</div>}
            </div>
          </div>
        </main>

        {/* Add User Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                <button onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                {formError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{formError}</div>}

                {[
                  { label: "Full Name", key: "name", type: "text", placeholder: "John Doe" },
                  { label: "Email Address", key: "email", type: "email", placeholder: "john@example.com" },
                  { label: "Phone Number", key: "phone", type: "tel", placeholder: "+91 98765 43210" },
                  { label: "Password", key: "password", type: "password", placeholder: "Min. 6 characters" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-gray-900 mb-1">{f.label}</label>
                    <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder} required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>

                <SingleImageUpload
                  value={form.image}
                  onChange={url => setForm({ ...form, image: url })}
                  label="Profile Photo (optional)"
                  placeholder="https://example.com/photo.jpg"
                />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormError(""); }} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={formLoading} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                    {formLoading ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetails && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
              <div className="p-6 space-y-4">
                {/* Photo */}
                <div className="flex justify-center mb-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-gray-200">
                    {(selectedUser as any).image ? (
                      <img src={(selectedUser as any).image} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-primary">{selectedUser.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                {[
                  { label: "Name", value: selectedUser.name },
                  { label: "Email", value: selectedUser.email },
                  { label: "Phone", value: selectedUser.phone },
                  { label: "Total Appointments", value: String(selectedUser.appointments) },
                  { label: "Join Date", value: new Date(selectedUser.joinDate).toLocaleDateString() },
                ].map(row => (
                  <div key={row.label}>
                    <p className="text-sm text-gray-500 font-medium">{row.label}</p>
                    <p className="text-gray-900 font-semibold">{row.value}</p>
                  </div>
                ))}
                <div>
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${selectedUser.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <Button variant="outline" onClick={() => setShowDetails(false)} className="flex-1">Close</Button>
                <Button onClick={() => handleDelete(selectedUser.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete User</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
