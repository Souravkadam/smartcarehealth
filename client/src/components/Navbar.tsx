import { useHospitalContext } from "@/contexts/HospitalContext";
import { useUserContext } from "@/contexts/UserContext";
import { Heart, Menu, X, ChevronDown, User, LogOut, Calendar } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCompareMenu, setShowCompareMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { compareList } = useHospitalContext();
  const { user, isLoggedIn, logout } = useUserContext();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setLocation("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">♥</div>
              <span>SmartCare</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/"><a className="text-gray-700 hover:text-primary transition-colors font-medium">Home</a></Link>
            <Link href="/hospitals"><a className="text-gray-700 hover:text-primary transition-colors font-medium">Hospitals</a></Link>

            {/* Compare Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-1">
                Compare <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link href="/compare"><a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg">Hospitals</a></Link>
                <Link href="/compare/services"><a className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Services</a></Link>
                <Link href="/compare/doctors"><a className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Doctors</a></Link>
                <Link href="/compare/facilities"><a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg">Facilities</a></Link>
              </div>
            </div>

            <Link href="/calculator"><a className="text-gray-700 hover:text-primary transition-colors font-medium">Cost Calculator</a></Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {compareList.length > 0 && (
              <Link href="/compare">
                <a>
                  <Button variant="outline" size="sm" className="relative">
                    <Heart className="w-4 h-4 mr-1" />
                    Compare ({compareList.length})
                  </Button>
                </a>
              </Link>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{user?.name.split(" ")[0]}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-4 py-3 bg-primary/5 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    {/* Only show for regular users — admins use the sidebar */}
                    {user?.role !== "admin" && user?.role !== "super_admin" && (
                      <>
                        <Link href="/profile">
                          <a onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <User className="w-4 h-4 text-primary" />My Profile
                          </a>
                        </Link>
                        <Link href="/my-appointments">
                          <a onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <Calendar className="w-4 h-4 text-primary" />My Appointments
                          </a>
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" />Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login"><a><Button variant="outline" size="sm">Login</Button></a></Link>
                <Link href="/register"><a><Button size="sm" className="bg-primary hover:bg-primary/90 text-white">Register</Button></a></Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-1">
            <Link href="/"><a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>Home</a></Link>
            <Link href="/hospitals"><a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>Hospitals</a></Link>
            <div>
              <button onClick={() => setShowCompareMenu(!showCompareMenu)} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-between">
                Compare <ChevronDown className={`w-4 h-4 transition-transform ${showCompareMenu ? "rotate-180" : ""}`} />
              </button>
              {showCompareMenu && (
                <div className="pl-4 space-y-1 mt-1">
                  {[["Hospitals","/compare"],["Services","/compare/services"],["Doctors","/compare/doctors"],["Facilities","/compare/facilities"]].map(([label, href]) => (
                    <Link key={href} href={href}><a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>{label}</a></Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/calculator"><a className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setIsOpen(false)}>Cost Calculator</a></Link>

            <div className="px-4 pt-3 border-t border-gray-200 mt-2">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 text-sm text-red-600 font-medium">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login"><a className="flex-1"><Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>Login</Button></a></Link>
                  <Link href="/register"><a className="flex-1"><Button className="w-full bg-primary text-white" onClick={() => setIsOpen(false)}>Register</Button></a></Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
