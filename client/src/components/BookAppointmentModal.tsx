import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/UserContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { bookAppointment } from "@/lib/api";
import { saveBillingData } from "@/pages/BillingPage";
import {
  Calendar, Clock, X, CreditCard,
  Loader2, User, Stethoscope,
} from "lucide-react";
import { Hospital, Doctor } from "@/data/hospitals";
import { useLocation } from "wouter";

interface Props {
  hospital: Hospital;
  onClose: () => void;
}

const TIME_SLOTS = [
  "09:00 AM","09:30 AM","10:00 AM","10:30 AM",
  "11:00 AM","11:30 AM","12:00 PM","02:00 PM",
  "02:30 PM","03:00 PM","03:30 PM","04:00 PM",
  "04:30 PM","05:00 PM",
];

type Step = 1 | 2 | 3 | 4;

export default function BookAppointmentModal({ hospital, onClose }: Props) {
  const { user, token, isLoggedIn } = useUserContext();
  const { pay } = useRazorpay();
  const [, setLocation] = useLocation();

  const [step, setStep]                     = useState<Step>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [date, setDate]                   = useState("");
  const [time, setTime]                   = useState("");
  const [reason, setReason]               = useState("");
  const [payLoading, setPayLoading]       = useState(false);
  const [error, setError]                 = useState("");

  const today = new Date().toISOString().split("T")[0];

  const canNext1 = !!selectedDoctor;
  const canNext2 = !!date && !!time;
  const canNext3 = reason.trim().length > 0;

  // ── Step labels ──────────────────────────────────────────────────────────
  const steps = [
    { n: 1, label: "Doctor" },
    { n: 2, label: "Schedule" },
    { n: 3, label: "Reason" },
    { n: 4, label: "Payment" },
  ];

  // ── Final: book appointment + pay ────────────────────────────────────────
  const handlePay = async () => {
    if (!selectedDoctor || !date || !time || !reason) return;
    if (!isLoggedIn || !token || !user) {
      setError("Please login to book an appointment");
      return;
    }
    setPayLoading(true);
    setError("");

    // 1. First create the appointment record
    let appointmentId = "";
    try {
      const apt = await bookAppointment(token, {
        hospitalId: hospital.id,
        doctorId:   selectedDoctor.id,
        date, time, reason,
        userName:  user.name,
        userEmail: user.email,
        userPhone: user.phone || "",
      });
      appointmentId = (apt as any)._id || "";
    } catch (err: any) {
      setError(err.message || "Failed to create appointment");
      setPayLoading(false);
      return;
    }

    // 2. Open Razorpay checkout
    await pay({
      amount:        selectedDoctor.consultationFee,
      description:   `Consultation with ${selectedDoctor.name} at ${hospital.name}`,
      appointmentId,
      onSuccess: (data) => {
        // Generate unique bill number
        const billNo = `SC${Date.now().toString().slice(-8).toUpperCase()}`;
        saveBillingData({
          billNo,
          paymentId:       data.paymentId,
          orderId:         data.orderId,
          amount:          selectedDoctor!.consultationFee,
          doctorName:      selectedDoctor!.name,
          doctorSpecialty: selectedDoctor!.specialty,
          hospitalName:    hospital.name,
          date,
          time,
          reason,
          paidAt:          new Date().toISOString(),
        });
        onClose();
        setLocation("/billing");
      },
      onFailure: (msg) => {
        setError(`Payment failed: ${msg}. Your appointment is saved but unpaid.`);
        setPayLoading(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Book Appointment</h2>
            <p className="text-xs text-gray-400">{hospital.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-5 py-4 border-b border-gray-100">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.n ? "bg-green-500 text-white" :
                  step === s.n ? "bg-primary text-white" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <span className={`text-xs mt-1 font-medium ${step === s.n ? "text-primary" : "text-gray-400"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${step > s.n ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="p-5">
          {/* Not logged in */}
          {!isLoggedIn && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
              Please <a href="/login" className="font-semibold underline">login</a> to book an appointment.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          {/* ── STEP 1: Select Doctor ── */}
          {step === 1 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" /> Choose a Doctor
              </p>
              <div className="space-y-2">
                {hospital.doctors.map((doctor) => (
                  <button key={doctor.id} onClick={() => setSelectedDoctor(doctor)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedDoctor?.id === doctor.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary/40"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialty} · {doctor.experience} yrs</p>
                        <p className="text-xs text-gray-400 mt-0.5">{doctor.availability}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">₹{doctor.consultationFee.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-yellow-600">★ {doctor.rating}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} disabled={!canNext1 || !isLoggedIn}
                className="w-full mt-5 bg-primary text-white">
                Next: Choose Schedule →
              </Button>
            </div>
          )}

          {/* ── STEP 2: Date & Time ── */}
          {step === 2 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Pick Date & Time
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
                <input type="date" min={today} value={date} onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => setTime(slot)}
                      className={`py-2 text-xs rounded-lg border-2 font-medium transition-all ${
                        time === slot ? "border-primary bg-primary text-white" : "border-gray-200 hover:border-primary text-gray-700"
                      }`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                <Button onClick={() => setStep(3)} disabled={!canNext2} className="flex-1 bg-primary text-white">
                  Next: Reason →
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Reason ── */}
          {step === 3 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Reason for Visit
              </p>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Describe your symptoms or reason for the visit..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm" />
              <div className="flex gap-3 mt-5">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Back</Button>
                <Button onClick={() => setStep(4)} disabled={!canNext3} className="flex-1 bg-primary text-white">
                  Next: Review & Pay →
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review & Pay ── */}
          {step === 4 && selectedDoctor && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Review & Pay
              </p>

              {/* Summary card */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Doctor</span>
                  <span className="font-semibold text-gray-900">{selectedDoctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Specialty</span>
                  <span className="text-gray-700">{selectedDoctor.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hospital</span>
                  <span className="text-gray-700">{hospital.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-700">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="text-gray-700">{time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reason</span>
                  <span className="text-gray-700 text-right max-w-[60%]">{reason}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Consultation Fee</span>
                  <span className="font-bold text-primary text-lg">₹{selectedDoctor.consultationFee.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Patient info */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-5 text-sm">
                <p className="font-semibold text-gray-700 mb-1">Paying as</p>
                <p className="text-gray-900">{user?.name} · {user?.email}</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1" disabled={payLoading}>
                  ← Back
                </Button>
                <Button
                  onClick={handlePay}
                  disabled={payLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                >
                  {payLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" />Pay ₹{selectedDoctor.consultationFee.toLocaleString("en-IN")}</>
                  )}
                </Button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 Secured by Razorpay · UPI · Cards · Net Banking · Wallets
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
