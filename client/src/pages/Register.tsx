import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/UserContext";
import { Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useUserContext();
  const [, setLocation] = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, name: string, type: string, placeholder: string, Icon: any) => (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input type={type} name={name} value={(formData as any)[name]} onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <Navbar />
      <section className="py-12">
        <div className="container max-w-md">
          <div className="card-healthcare p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-4">♥</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Account</h1>
              <p className="text-gray-500">Join SmartCare to find the best hospitals</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {field("Full Name", "name", "text", "John Doe", User)}
              {field("Email Address", "email", "email", "you@example.com", Mail)}
              {field("Phone Number", "phone", "tel", "+91 98765 43210", Phone)}

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input type="checkbox" className="w-4 h-4 rounded mt-0.5" required />
                <span className="text-sm text-gray-600">I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a></span>
              </label>

              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-semibold text-base">
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-gray-600 mt-6 text-sm">
              Already have an account?{" "}
              <Link href="/login"><a className="text-primary font-semibold hover:underline">Sign in</a></Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
