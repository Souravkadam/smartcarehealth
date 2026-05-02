import AdminSidebar from "@/components/AdminSidebar";
import AdminModal from "@/components/AdminModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Hospital, Service } from "@/data/hospitals";
import { fetchHospitals } from "@/lib/api";
import { Edit2, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminServices() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [services, setServices] = useState<
    (Service & { hospitalId: string; hospitalName: string })[]
  >([]);

  useEffect(() => {
    fetchHospitals().then((data) => {
      setHospitals(data);
      setServices(
        data.flatMap((h) =>
          h.services.map((s) => ({ ...s, hospitalId: h.id, hospitalName: h.name }))
        )
      );
    }).catch(console.error);
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    basePrice: 0,
    estimatedStay: 0,
    hospitalId: "",
  });

  const handleOpenModal = (
    service?: (Service & { hospitalId: string; hospitalName: string })
  ) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        name: service.name,
        category: service.category,
        basePrice: service.basePrice,
        estimatedStay: service.estimatedStay,
        hospitalId: service.hospitalId,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        category: "",
        basePrice: 0,
        estimatedStay: 0,
        hospitalId: hospitals[0]?.id || "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      // Update
      setServices(
        services.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: formData.name,
                category: formData.category,
                basePrice: formData.basePrice,
                estimatedStay: formData.estimatedStay,
              }
            : s
        )
      );
    } else {
      // Create
      const newService: Service & {
        hospitalId: string;
        hospitalName: string;
      } = {
        id: `service-${Date.now()}`,
        name: formData.name,
        category: formData.category,
        basePrice: formData.basePrice,
        estimatedStay: formData.estimatedStay,
        hospitalId: formData.hospitalId,
        hospitalName:
          hospitals.find((h) => h.id === formData.hospitalId)?.name || "",
      };
      setServices([...services, newService]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices(services.filter((s) => s.id !== id));
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
                <h1 className="text-3xl font-bold text-gray-900">Services</h1>
                <p className="text-gray-600 mt-2">
                  Manage all services offered by hospitals
                </p>
              </div>
              <Button
                onClick={() => handleOpenModal()}
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </div>

            {/* Table */}
            <div className="card-healthcare overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-bold text-gray-900">
                      Service Name
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-900">
                      Category
                    </th>
                    <th className="text-center py-4 px-6 font-bold text-gray-900">
                      Base Price
                    </th>
                    <th className="text-center py-4 px-6 font-bold text-gray-900">
                      Est. Stay (Days)
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-900">
                      Hospital
                    </th>
                    <th className="text-center py-4 px-6 font-bold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {service.name}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {service.category}
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-gray-900">
                        ₹{service.basePrice.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-gray-900">
                        {service.estimatedStay}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {service.hospitalName}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(service)}
                            className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {services.length === 0 && (
              <div className="card-healthcare p-12 text-center">
                <p className="text-gray-600 mb-4">No services found</p>
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Add First Service
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Modal */}
        <AdminModal
          isOpen={isModalOpen}
          title={editingId ? "Edit Service" : "Add Service"}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          submitText={editingId ? "Update" : "Create"}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Service Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Cardiac Surgery"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Surgery"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Base Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Estimated Stay (Days)
                </label>
                <input
                  type="number"
                  value={formData.estimatedStay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedStay: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
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
        </AdminModal>
      </div>
    </ProtectedRoute>
  );
}
