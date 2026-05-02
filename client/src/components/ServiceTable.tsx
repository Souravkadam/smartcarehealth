import { Service } from "@/data/hospitals";
import { formatPrice } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface ServiceTableProps {
  services: Service[];
}

export default function ServiceTable({ services }: ServiceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-bold text-gray-900">
              Service Name
            </th>
            <th className="text-left py-3 px-4 font-bold text-gray-900">
              Category
            </th>
            <th className="text-right py-3 px-4 font-bold text-gray-900">
              Base Price
            </th>
            <th className="text-center py-3 px-4 font-bold text-gray-900">
              Est. Stay
            </th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr
              key={service.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-4 px-4">
                <div>
                  <div className="font-semibold text-gray-900">
                    {service.name}
                  </div>
                  {service.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {service.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {service.category}
                </span>
              </td>
              <td className="py-4 px-4 text-right">
                <div className="font-bold text-primary text-lg">
                  {formatPrice(service.basePrice)}
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <div className="flex items-center justify-center gap-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{service.estimatedStay} day(s)</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
