import { useAdminContext } from "@/contexts/AdminContext";
import {
  Building2, Users, Stethoscope, Package,
  LogOut, Menu, X, Calendar, LayoutDashboard, Shield, User as UserIcon, IndianRupee,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, adminUser } = useAdminContext();
  const [location] = useLocation();

  const menuItems = [
    { href: "/admin/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
    { href: "/admin/hospitals",    label: "Hospitals",    icon: Building2 },
    { href: "/admin/doctors",      label: "Doctors",      icon: Stethoscope },
    { href: "/admin/services",     label: "Services",     icon: Package },
    { href: "/admin/appointments", label: "Appointments", icon: Calendar },
    { href: "/admin/payments",     label: "Payments",     icon: IndianRupee },
    { href: "/admin/users",        label: "Users",        icon: Users },
  ];

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col transform transition-transform md:translate-x-0 z-40 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Logo */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-800">
          <Link href="/admin/dashboard">
            <button className="flex items-center gap-2.5 font-bold text-lg hover:opacity-80 transition-opacity w-full text-left bg-transparent border-none text-white">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">♥</div>
              <span>SmartCare</span>
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Admin</span>
            </button>
          </Link>
        </div>

        {/* Admin Profile Card */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center flex-shrink-0 shadow">
              <span className="text-white font-bold text-sm">
                {adminUser?.name?.charAt(0).toUpperCase() ?? "A"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{adminUser?.name ?? "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{adminUser?.email}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium capitalize">{adminUser?.role?.replace("_", " ") ?? "Admin"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider px-3 mb-2">Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full text-left border-none cursor-pointer text-sm font-medium ${
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 pt-4 border-t border-gray-800">
          <Button
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center gap-2 rounded-xl py-2.5"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 md:hidden z-30" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
