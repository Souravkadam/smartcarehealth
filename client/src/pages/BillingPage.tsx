import Navbar from "@/components/Navbar";
import { useUserContext } from "@/contexts/UserContext";
import { CheckCircle, Download, Home, Calendar, Clock, Stethoscope, Building2, Phone, Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useEffect, useRef } from "react";

export interface BillingData {
  billNo: string;
  paymentId: string;
  orderId: string;
  amount: number;
  doctorName: string;
  doctorSpecialty: string;
  hospitalName: string;
  date: string;
  time: string;
  reason: string;
  paidAt: string;
}

// Stored in sessionStorage so it survives navigation
const BILLING_KEY = "sc_billing_data";

export function saveBillingData(data: BillingData) {
  sessionStorage.setItem(BILLING_KEY, JSON.stringify(data));
}

export function getBillingData(): BillingData | null {
  const raw = sessionStorage.getItem(BILLING_KEY);
  return raw ? JSON.parse(raw) : null;
}

export default function BillingPage() {
  const { user } = useUserContext();
  const [, setLocation] = useLocation();
  const printRef = useRef<HTMLDivElement>(null);

  const bill = getBillingData();

  useEffect(() => {
    if (!bill) setLocation("/hospitals");
  }, []);

  if (!bill) return null;

  const handlePrint = () => window.print();

  const handleDownload = () => {
    // Simple text-based download — in production use jsPDF
    const content = `
SMARTCARE - APPOINTMENT BILL
==============================
Bill No     : ${bill.billNo}
Payment ID  : ${bill.paymentId}
Date        : ${new Date(bill.paidAt).toLocaleString("en-IN")}

PATIENT DETAILS
---------------
Name        : ${user?.name}
Mobile      : ${(user as any)?.phone || "—"}
Email       : ${user?.email}

APPOINTMENT DETAILS
-------------------
Doctor      : ${bill.doctorName}
Specialty   : ${bill.doctorSpecialty}
Hospital    : ${bill.hospitalName}
Date        : ${bill.date}
Time        : ${bill.time}
Reason      : ${bill.reason}

PAYMENT SUMMARY
---------------
Consultation Fee : ₹${bill.amount.toLocaleString("en-IN")}
Status           : PAID ✓

Thank you for choosing SmartCare!
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `SmartCare_Bill_${bill.billNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>

      <div className="container max-w-2xl py-8 px-4">
        {/* Success banner */}
        <div className="flex flex-col items-center mb-8 print:hidden">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-9 h-9 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-500 text-sm mt-1">Your appointment has been confirmed</p>
        </div>

        {/* Bill card */}
        <div ref={printRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg font-bold">♥</div>
                <div>
                  <p className="font-bold text-lg">SmartCare</p>
                  <p className="text-xs text-white/70">Healthcare Platform</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">Bill No.</p>
                <p className="font-mono font-bold text-sm">{bill.billNo}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* Patient info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Patient Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Mobile</p>
                    <p className="font-semibold text-gray-900 text-sm">{(user as any)?.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-semibold text-gray-900 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200" />

            {/* Appointment info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Appointment Details</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-gray-500">Doctor</span>
                    <span className="text-sm font-semibold text-gray-900">{bill.doctorName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <span className="text-primary text-xs">Rx</span>
                  </div>
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-gray-500">Specialty</span>
                    <span className="text-sm font-semibold text-gray-900">{bill.doctorSpecialty}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-gray-500">Hospital</span>
                    <span className="text-sm font-semibold text-gray-900 text-right max-w-[55%]">{bill.hospitalName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(bill.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-gray-500">Time</span>
                    <span className="text-sm font-semibold text-gray-900">{bill.time}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200" />

            {/* Payment summary */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Summary</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Consultation Fee</span>
                  <span className="font-semibold text-gray-900">₹{bill.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST / Tax</span>
                  <span className="text-gray-500">Included</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-bold text-gray-900">Total Paid</span>
                  <span className="font-bold text-primary text-lg">₹{bill.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Payment ID + status */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">Payment Confirmed</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Payment ID</span>
                <span className="font-mono text-gray-700">{bill.paymentId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono text-gray-700">{bill.orderId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Paid On</span>
                <span className="text-gray-700">
                  {new Date(bill.paidAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-gray-400">
              Thank you for choosing SmartCare. Please carry this bill to your appointment.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="flex-1 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1 flex items-center gap-2">
            <Download className="w-4 h-4" /> Download
          </Button>
          <Link href="/">
            <Button className="flex-1 bg-primary text-white flex items-center gap-2">
              <Home className="w-4 h-4" /> Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
