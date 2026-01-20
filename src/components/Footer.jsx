import React from "react";
import {
  BookOpen,
  Mail,
  Heart,
  Github,
  Twitter,
  Instagram,
} from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                BookFinder
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Descubre, organiza y gestiona tu biblioteca personal. Encuentra tu
              próxima lectura favorita.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600 transition"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600 transition"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-purple-600 transition"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-purple-600 transition text-sm"
                >
                  Explorar
                </Link>
              </li>
              <li>
                <Link
                  to="/library"
                  className="text-gray-600 hover:text-purple-600 transition text-sm"
                >
                  Mi Biblioteca
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="text-gray-600 hover:text-purple-600 transition text-sm"
                >
                  Favoritos
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-purple-600 transition text-sm"
                >
                  Perfil
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition text-sm"
                >
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition text-sm"
                >
                  Términos de Uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition text-sm"
                >
                  Política de Cookies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-purple-600 transition text-sm"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {currentYear} BookFinder. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-xs flex items-center gap-1">
              Hecho con <Heart className="w-4 h-4 text-red-500 fill-red-500" />{" "}
              para los amantes de la lectura
            </p>
          </div>
        </div>

        {/* Nota de afiliados */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Como afiliado de Amazon, ganamos con las compras calificadas
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
