import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/contexts/UserContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUserContext();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(email, password);
      if (role === "admin" || role === "super_admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5">
      <Navbar />
      <section className="py-16">
        <div className="container max-w-md">
          <div className="card-healthcare p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white text-2xl mx-auto mb-4">♥</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back</h1>
              <p className="text-gray-500">Sign in to your SmartCare account</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 font-semibold text-base">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-gray-600 mt-6 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register"><a className="text-primary font-semibold hover:underline">Sign up</a></Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
