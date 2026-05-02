import AdminSidebar from "@/components/AdminSidebar";
import AdminModal from "@/components/AdminModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { SingleImageUpload } from "@/components/ImageUpload";
import { Hospital, Doctor } from "@/data/hospitals";
import { fetchHospitals } from "@/lib/api";
import { Edit2, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminDoctors() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<
    (Doctor & { hospitalId: string; hospitalName: string })[]
  >([]);

  useEffect(() => {
    fetchHospitals().then((data) => {
      setHospitals(data);
      setDoctors(
        data.flatMap((h) =>
          h.doctors.map((d) => ({ ...d, hospitalId: h.id, hospitalName: h.name }))
        )
      );
    }).catch(console.error);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    experience: 0,
    consultationFee: 0,
    rating: 0,
    hospitalId: "",
    image: "",
  });

  const handleOpenModal = (
    doctor?: (Doctor & { hospitalId: string; hospitalName: string })
  ) => {
    if (doctor) {
      setEditingId(doctor.id);
      setFormData({
        name: doctor.name,
        specialty: doctor.specialty,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        rating: doctor.rating,
        hospitalId: doctor.hospitalId,
        image: (doctor as any).image || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        specialty: "",
        experience: 0,
        consultationFee: 0,
        rating: 0,
        hospitalId: hospitals[0]?.id || "",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update
      setDoctors(
        doctors.map((d) =>
          d.id === editingId
            ? {
                ...d,
                name: formData.name,
                specialty: formData.specialty,
                experience: formData.experience,
                consultationFee: formData.consultationFee,
                rating: formData.rating,
                availability: "Available",
              }
            : d
        )
      );
    } else {
      // Create
      const newDoctor: Doctor & { hospitalId: string; hospitalName: string } =
        {
          id: `doctor-${Date.now()}`,
          name: formData.name,
          specialty: formData.specialty,
          experience: formData.experience,
          consultationFee: formData.consultationFee,
          rating: formData.rating,
          availability: "Available",
          hospitalId: formData.hospitalId,
          hospitalName:
            hospitals.find((h) => h.id === formData.hospitalId)?.name ||
            "",
        };
      setDoctors([...doctors, newDoctor]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this doctor?")) {
      setDoctors(doctors.filter((d) => d.id !== id));
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
                <p className="text-gray-600 mt-2">
                  Manage all doctors in the system
                </p>
              </div>
              <Button
                onClick={() => handleOpenModal()}
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Doctor
              </Button>
            </div>

            {/* Table */}
            <div className="card-healthcare overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-4 font-bold text-gray-900 text-sm">Photo</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-900 text-sm">Name</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-900 text-sm">Specialty</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm">Experience</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm">Fee</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm">Rating</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-900 text-sm">Hospital</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                          {(doctor as any).image ? (
                            <img src={(doctor as any).image} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary font-bold text-sm">{doctor.name.split(" ").pop()?.charAt(0)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 text-sm">{doctor.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{doctor.specialty}</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900 text-sm">{doctor.experience} yrs</td>
                      <td className="py-3 px-4 text-center font-semibold text-gray-900 text-sm">₹{doctor.consultationFee}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                          ★ {doctor.rating}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{doctor.hospitalName}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenModal(doctor)} className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(doctor.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {doctors.length === 0 && (
              <div className="card-healthcare p-12 text-center">
                <p className="text-gray-600 mb-4">No doctors found</p>
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Add First Doctor
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Modal */}
        <AdminModal
          isOpen={isModalOpen}
          title={editingId ? "Edit Doctor" : "Add Doctor"}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          submitText={editingId ? "Update" : "Create"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Doctor Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter doctor name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Specialty
              </label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                placeholder="e.g., Cardiology"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationFee: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rating
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Hospital
                </label>
                <select
                  value={formData.hospitalId}
                  onChange={(e) =>
                    setFormData({ ...formData, hospitalId: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <SingleImageUpload
              value={formData.image}
              onChange={url => setFormData({ ...formData, image: url })}
              label="Doctor Photo (optional)"
              placeholder="https://example.com/doctor.jpg"
            />
          </div>
        </AdminModal>
      </div>
    </ProtectedRoute>
  );
}
