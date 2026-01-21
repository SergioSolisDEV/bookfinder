import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Mail,
  ExternalLink,
  Clock,
  DollarSign,
  User,
  AlertCircle,
  BookOpen,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BookCard from "../components/BookCard";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSeo";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getLibrary,
  addToLibrary,
  removeFromLibrary,
} from "../lib/database";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [email, setEmail] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false); // ← NUEVO: Modal de login
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [library, setLibrary] = useState({
    wantToRead: [],
    reading: [],
    read: [],
  });

  // ✅ SEO dinámico
  useSEO({
    title: "Explorar Libros - BookFinder | Descubre tu próxima lectura",
    description:
      "Descubre miles de libros en español. Busca por género, autor o tema. Organiza tu biblioteca personal y encuentra tu próxima lectura favorita.",
    keywords:
      "libros, buscar libros, recomendaciones de libros, libros en español, biblioteca personal, lectura, BookFinder",
    ogImage: "https://bookfinder.vercel.app/og-image.jpg", // Crear esta imagen después
    canonicalUrl: "https://bookfinder.vercel.app/",
  });

  // ✅ Cargar datos SOLO si hay usuario autenticado
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const [favs, lib] = await Promise.all([
        getFavorites(user.id),
        getLibrary(user.id),
      ]);
      setFavorites(favs);
      setLibrary(lib);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const processQuery = (query) => {
    const stopWords = [
      "el",
      "la",
      "de",
      "que",
      "y",
      "un",
      "una",
      "para",
      "con",
      "me",
      "algo",
    ];
    const words = query
      .toLowerCase()
      .split(" ")
      .filter((word) => !stopWords.includes(word));
    return words.join(" ");
  };

  // ✅ Búsqueda pública (sin login)
  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    const processedQuery = processQuery(searchQuery);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(processedQuery)}&maxResults=10&langRestrict=es`,
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.items && data.items.length > 0) {
        setBooks(data.items);
        if (!showNewsletter && !user) {
          setTimeout(() => setShowNewsletter(true), 3000);
        }
      } else {
        setBooks([]);
        setError(
          "No se encontraron libros. Intenta con otros términos de búsqueda.",
        );
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Hubo un error al buscar libros. Por favor, intenta de nuevo.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    if (email.trim() && email.includes("@")) {
      alert(`¡Gracias por suscribirte! Enviaremos recomendaciones a ${email}`);
      setEmail("");
      setShowNewsletter(false);
    } else {
      alert("Por favor, ingresa un email válido");
    }
  };

  const getAffiliateLink = (title, authors) => {
    const searchTerm = `${title} ${authors?.[0] || ""}`.replace(/\s+/g, "+");
    return `https://www.amazon.es/s?k=${searchTerm}&tag=YOUR-AFFILIATE-ID`;
  };

  // 🔒 Verificar autenticación antes de agregar a favoritos
  const toggleFavorite = async (book) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const isFav = favorites.some((fav) => fav.id === book.id);

    try {
      if (isFav) {
        await removeFavorite(user.id, book.id);
        setFavorites(favorites.filter((fav) => fav.id !== book.id));
      } else {
        await addFavorite(user.id, book);
        setFavorites([...favorites, book]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Error al actualizar favoritos");
    }
  };

  const isFavorite = (book) => {
    if (!user) return false;
    return favorites.some((fav) => fav.id === book.id);
  };

  // 🔒 Verificar autenticación antes de agregar a biblioteca
  const addToLibraryShelf = async (book, shelf) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const currentShelf = getBookShelf(book);

    try {
      if (currentShelf === shelf) {
        await removeFromLibrary(user.id, book.id);
        const newLibrary = {
          wantToRead: library.wantToRead.filter((b) => b.id !== book.id),
          reading: library.reading.filter((b) => b.id !== book.id),
          read: library.read.filter((b) => b.id !== book.id),
        };
        setLibrary(newLibrary);
      } else {
        await addToLibrary(user.id, book, shelf);
        const newLibrary = {
          wantToRead: library.wantToRead.filter((b) => b.id !== book.id),
          reading: library.reading.filter((b) => b.id !== book.id),
          read: library.read.filter((b) => b.id !== book.id),
        };
        newLibrary[shelf] = [...newLibrary[shelf], book];
        setLibrary(newLibrary);
      }
    } catch (error) {
      console.error("Error updating library:", error);
      setError("Error al actualizar biblioteca");
    }
  };

  const getBookShelf = (book) => {
    if (!user) return null;
    if (library.wantToRead.some((b) => b.id === book.id)) return "wantToRead";
    if (library.reading.some((b) => b.id === book.id)) return "reading";
    if (library.read.some((b) => b.id === book.id)) return "read";
    return null;
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />

        <main className="flex-1 max-w-6xl mx-auto px-4 py-6 sm:py-8 w-full">
          {/* Sección de búsqueda */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
              ¿Qué libro estás buscando?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Describe el tipo de libro que buscas, el género, cómo te sientes,
              o cualquier detalle que te ayude a encontrar tu próxima lectura
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchBooks()}
                placeholder="Ej: Busco ciencia ficción..."
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm sm:text-base"
              />
              <button
                onClick={searchBooks}
                disabled={loading}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                <Search className="w-5 h-5" />
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
              </div>
            )}
          </div>

          {/* Resultados */}
          {books.length > 0 && (
            <>
              <div className="mb-4">
                <p className="text-gray-700 font-semibold text-sm sm:text-base">
                  Encontrados {books.length} libros
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onClick={setSelectedBook}
                    isFavorite={isFavorite(book)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>

              {/* AdSense placeholder */}
              <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-4 sm:p-8 text-center mb-8">
                <p className="text-gray-600 text-sm sm:text-base">
                  AdSense Banner (Responsive)
                </p>
              </div>
            </>
          )}
        </main>

        {/* Modal de detalles del libro */}
        {selectedBook && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedBook(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold pr-8">
                    {selectedBook.volumeInfo.title}
                  </h2>
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div className="md:col-span-1">
                    <div className="bg-gray-200 rounded-lg overflow-hidden">
                      {selectedBook.volumeInfo.imageLinks?.thumbnail ? (
                        <img
                          src={selectedBook.volumeInfo.imageLinks.thumbnail
                            .replace("http:", "https:")
                            .replace("&edge=curl", "")
                            .replace("zoom=1", "zoom=2")}
                          alt={selectedBook.volumeInfo.title}
                          className="w-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="w-5 h-5" />
                        <span className="font-semibold">Autor:</span>
                        <span>
                          {selectedBook.volumeInfo.authors?.join(", ") ||
                            "Desconocido"}
                        </span>
                      </div>

                      {selectedBook.volumeInfo.pageCount && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5" />
                          <span className="font-semibold">Páginas:</span>
                          <span>
                            {selectedBook.volumeInfo.pageCount} (~
                            {Math.round(
                              selectedBook.volumeInfo.pageCount / 50,
                            )}{" "}
                            horas)
                          </span>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Sinopsis:
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {selectedBook.volumeInfo.description ||
                            "No hay sinopsis disponible."}
                        </p>
                      </div>

                      {selectedBook.volumeInfo.categories && (
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">
                            Categorías:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedBook.volumeInfo.categories.map(
                              (cat, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                                >
                                  {cat}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* 🔒 Sección de biblioteca - requiere login */}
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Añadir a mi biblioteca:
                        </h3>
                        {!user && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm flex items-center gap-2">
                              <LogIn className="w-4 h-4" />
                              Inicia sesión para guardar libros en tu biblioteca
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() =>
                              addToLibraryShelf(selectedBook, "wantToRead")
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              getBookShelf(selectedBook) === "wantToRead"
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            }`}
                          >
                            Quiero Leer
                          </button>
                          <button
                            onClick={() =>
                              addToLibraryShelf(selectedBook, "reading")
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              getBookShelf(selectedBook) === "reading"
                                ? "bg-orange-600 text-white"
                                : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                            }`}
                          >
                            Leyendo
                          </button>
                          <button
                            onClick={() =>
                              addToLibraryShelf(selectedBook, "read")
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                              getBookShelf(selectedBook) === "read"
                                ? "bg-green-600 text-white"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            Leído
                          </button>
                        </div>
                      </div>

                      <a
                        href={getAffiliateLink(
                          selectedBook.volumeInfo.title,
                          selectedBook.volumeInfo.authors,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Comprar en Amazon
                      </a>
                      <p className="text-xs text-gray-500 text-center">
                        * Como afiliado de Amazon, ganamos con compras
                        calificadas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔒 Modal de autenticación */}
        {showAuthModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAuthModal(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <LogIn className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Inicia sesión
                </h3>
                <p className="text-gray-600 mb-6">
                  Para guardar libros en tu biblioteca y favoritos, necesitas
                  tener una cuenta.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition font-semibold"
                  >
                    Crear Cuenta
                  </button>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Newsletter modal */}
        {showNewsletter && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewsletter(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-8 h-8 text-purple-600" />
                  <h3 className="text-2xl font-bold">Newsletter</h3>
                </div>
                <button
                  onClick={() => setShowNewsletter(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Recibe recomendaciones personalizadas de libros cada semana
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none mb-4"
              />
              <button
                onClick={handleSubscribe}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Suscribirme
              </button>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}

export default Home;
