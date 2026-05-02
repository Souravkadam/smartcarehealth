import { useCallback } from "react";
import { createPaymentOrder, verifyPayment } from "@/lib/api";
import { useUserContext } from "@/contexts/UserContext";

declare global {
  interface Window { Razorpay: any; }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface PaySuccessData {
  paymentId: string;
  orderId: string;
  amount: number;       // in ₹
}

interface PayOptions {
  amount: number;       // in ₹
  description: string;
  appointmentId?: string;
  onSuccess?: (data: PaySuccessData) => void;
  onFailure?: (error: string) => void;
}

export function useRazorpay() {
  const { user, token } = useUserContext();

  const pay = useCallback(async (opts: PayOptions) => {
    if (!token || !user) {
      opts.onFailure?.("Please login to make a payment");
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      opts.onFailure?.("Failed to load Razorpay. Check your internet connection.");
      return;
    }

    let order: Awaited<ReturnType<typeof createPaymentOrder>>;
    try {
      order = await createPaymentOrder(token, {
        amount:        opts.amount,
        description:   opts.description,
        userName:      user.name,
        userEmail:     user.email,
        appointmentId: opts.appointmentId,
      });
    } catch (err: any) {
      opts.onFailure?.(err.message || "Could not create payment order");
      return;
    }

    const rzp = new window.Razorpay({
      key:         order.keyId,
      amount:      order.amount,   // paise
      currency:    order.currency,
      order_id:    order.orderId,

      // ── SmartCare branding ──────────────────────────────────────────────
      name:        "SmartCare",
      description: opts.description,
      image:       "https://img.icons8.com/color/96/heart-with-pulse.png",
      theme:       { color: "#0d9488" },

      prefill: {
        name:    user.name,
        email:   user.email,
        contact: (user as any).phone || "",
      },

      notes: {
        appointmentId: opts.appointmentId || "",
        description:   opts.description,
      },

      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await verifyPayment(token, {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          opts.onSuccess?.({
            paymentId: response.razorpay_payment_id,
            orderId:   response.razorpay_order_id,
            amount:    opts.amount,
          });
        } catch (err: any) {
          opts.onFailure?.(err.message || "Payment verification failed");
        }
      },

      modal: {
        ondismiss: () => opts.onFailure?.("Payment cancelled"),
      },
    });

    rzp.open();
  }, [token, user]);

  return { pay };
}
