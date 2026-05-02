import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRazorpay } from "@/hooks/useRazorpay";
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Props {
  amount: number;          // in ₹
  description: string;
  appointmentId?: string;
  onSuccess?: (paymentId: string) => void;
  className?: string;
  label?: string;
}

export default function PayNowButton({
  amount, description, appointmentId, onSuccess, className, label = "Pay Now",
}: Props) {
  const { pay } = useRazorpay();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "failed">("idle");
  const [message, setMessage] = useState("");

  const handlePay = async () => {
    setStatus("loading");
    setMessage("");
    await pay({
      amount,
      description,
      appointmentId,
      onSuccess: (paymentId) => {
        setStatus("success");
        setMessage(`Payment successful! ID: ${paymentId}`);
        onSuccess?.(paymentId);
      },
      onFailure: (err) => {
        setStatus("failed");
        setMessage(err);
      },
    });
    if (status === "loading") setStatus("idle");
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
        <CheckCircle className="w-5 h-5" />
        {message}
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={handlePay}
        disabled={status === "loading"}
        className={`bg-green-600 hover:bg-green-700 text-white font-semibold ${className}`}
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
        ) : (
          <><CreditCard className="w-4 h-4 mr-2" />{label} ₹{amount.toLocaleString("en-IN")}</>
        )}
      </Button>
      {status === "failed" && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <XCircle className="w-4 h-4" />{message}
        </p>
      )}
    </div>
  );
}
