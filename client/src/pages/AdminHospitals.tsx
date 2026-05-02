import AdminSidebar from "@/components/AdminSidebar";
import AdminModal from "@/components/AdminModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { SingleImageUpload } from "@/components/ImageUpload";
import { Hospital } from "@/data/hospitals";
import { getHospitalImage } from "@/data/images";
import { fetchHospitals } from "@/lib/api";
import { Edit2, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    fetchHospitals().then(setHospitals).catch(console.error);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    level: "Basic" | "Standard" | "Premium";
    beds: number;
    icuBeds: number;
    ots: number;
    phone: string;
    image: string;
  }>({
    name: "",
    address: "",
    level: "Standard",
    beds: 0,
    icuBeds: 0,
    ots: 0,
    phone: "",
    image: "",
  });

  const handleOpenModal = (hospital?: Hospital) => {
    if (hospital) {
      setEditingId(hospital.id);
      setFormData({
        name: hospital.name,
        address: hospital.address,
        level: hospital.level,
        beds: hospital.beds,
        icuBeds: hospital.icuBeds,
        ots: hospital.ots,
        phone: hospital.phone,
        image: (hospital as any).image || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        address: "",
        level: "Standard",
        beds: 0,
        icuBeds: 0,
        ots: 0,
        phone: "",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update
      setHospitals(
        hospitals.map((h) =>
          h.id === editingId
            ? {
                ...h,
                name: formData.name,
                address: formData.address,
                level: formData.level,
                beds: formData.beds,
                icuBeds: formData.icuBeds,
                ots: formData.ots,
                phone: formData.phone,
                image: formData.image,
              }
            : h
        )
      );
    } else {
      // Create
      const newHospital: Hospital = {
        ...hospitals[0],
        id: `hospital-${Date.now()}`,
        name: formData.name,
        address: formData.address,
        level: formData.level,
        beds: formData.beds,
        icuBeds: formData.icuBeds,
        ots: formData.ots,
        phone: formData.phone,
        image: formData.image,
      };
      setHospitals([...hospitals, newHospital]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this hospital?")) {
      setHospitals(hospitals.filter((h) => h.id !== id));
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
                <h1 className="text-3xl font-bold text-gray-900">Hospitals</h1>
                <p className="text-gray-600 mt-2">
                  Manage all hospitals in the system
                </p>
              </div>
              <Button
                onClick={() => handleOpenModal()}
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Hospital
              </Button>
            </div>

            {/* Table */}
            <div className="card-healthcare overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-4 font-bold text-gray-900 text-sm">Image</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-900 text-sm">Name</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-900 text-sm">Level</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm">Beds</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm">ICU Beds</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm">OTs</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((hospital) => {
                    const imgSrc = (hospital as any).image || getHospitalImage(hospital.name);
                    return (
                      <tr key={hospital.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={imgSrc}
                              alt={hospital.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=200&q=60&fit=crop"; }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-900 text-sm">{hospital.name}</p>
                          <p className="text-xs text-gray-500">{hospital.address}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            hospital.level === "Premium" ? "bg-blue-100 text-blue-700" :
                            hospital.level === "Standard" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>{hospital.level}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-900 text-sm">{hospital.beds}</td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-900 text-sm">{hospital.icuBeds}</td>
                        <td className="py-3 px-4 text-center font-semibold text-gray-900 text-sm">{hospital.ots}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleOpenModal(hospital)} className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(hospital.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {hospitals.length === 0 && (
              <div className="card-healthcare p-12 text-center">
                <p className="text-gray-600 mb-4">No hospitals found</p>
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Add First Hospital
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Modal */}
        <AdminModal
          isOpen={isModalOpen}
          title={editingId ? "Edit Hospital" : "Add Hospital"}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          submitText={editingId ? "Update" : "Create"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Hospital Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter hospital name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as "Basic" | "Standard" | "Premium",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option>Basic</option>
                  <option>Standard</option>
                  <option>Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Total Beds
                </label>
                <input
                  type="number"
                  value={formData.beds}
                  onChange={(e) =>
                    setFormData({ ...formData, beds: Number(e.target.value) })
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
                  ICU Beds
                </label>
                <input
                  type="number"
                  value={formData.icuBeds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      icuBeds: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Operation Theaters
                </label>
                <input
                  type="number"
                  value={formData.ots}
                  onChange={(e) =>
                    setFormData({ ...formData, ots: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <SingleImageUpload
              value={formData.image}
              onChange={url => setFormData({ ...formData, image: url })}
              label="Hospital Main Image (optional)"
              placeholder="https://example.com/hospital.jpg"
            />
          </div>
        </AdminModal>
      </div>
    </ProtectedRoute>
  );
}
