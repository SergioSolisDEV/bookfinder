import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Library,
  Heart,
  User,
  Mail,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Header({ onNewsletterOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-purple-100 text-purple-700"
      : "text-gray-700 hover:bg-gray-100";
  };

  const navItems = [
    { path: "/", icon: BookOpen, label: "Explorar" },
    { path: "/library", icon: Library, label: "Biblioteca" },
    { path: "/favorites", icon: Heart, label: "Favoritos" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              BookFinder
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isActive(item.path)}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewsletterOpen}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden lg:inline">Newsletter</span>
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition text-sm"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Salir</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4 space-y-2 animate-slideDown">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(item.path)}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => {
                onNewsletterOpen();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Mail className="w-5 h-5" />
              Newsletter
            </button>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
