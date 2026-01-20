import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
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
} from "lucide-react";
import Header from "../components/Header";
import BookCard from "../components/BookCard";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getLibrary,
  addToLibrary,
  removeFromLibrary,
} from "../lib/database";
import AdSenseBanner from "../components/AdSenseBanner";

function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [email, setEmail] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [library, setLibrary] = useState({
    wantToRead: [],
    reading: [],
    read: [],
  });
  const [dataLoading, setDataLoading] = useState(true);

  // Cargar datos al montar el componente
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
    } finally {
      setDataLoading(false);
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
        if (!showNewsletter) {
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

  const toggleFavorite = async (book) => {
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
    return favorites.some((fav) => fav.id === book.id);
  };

  const addToLibraryShelf = async (book, shelf) => {
    const currentShelf = getBookShelf(book);

    try {
      if (currentShelf === shelf) {
        // Eliminar de la biblioteca
        await removeFromLibrary(user.id, book.id);
        const newLibrary = {
          wantToRead: library.wantToRead.filter((b) => b.id !== book.id),
          reading: library.reading.filter((b) => b.id !== book.id),
          read: library.read.filter((b) => b.id !== book.id),
        };
        setLibrary(newLibrary);
      } else {
        // Mover a nuevo estante
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
    if (library.wantToRead.some((b) => b.id === book.id)) return "wantToRead";
    if (library.reading.some((b) => b.id === book.id)) return "reading";
    if (library.read.some((b) => b.id === book.id)) return "read";
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Explorar Libros - BookFinder</title>
        <meta
          name="description"
          content="Descubre tu próxima lectura favorita. Busca entre miles de libros y añádelos a tu biblioteca personal."
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />

        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-4 sm:p-8 text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              AdSense Banner (Responsive)
            </p>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
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
              <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-4 sm:p-8 text-center mb-8">
                <p className="text-gray-600 text-sm sm:text-base">
                  AdSense Banner (Responsive)
                </p>
              </div>
            </>
          )}
        </main>

        {selectedBook && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-all duration-300 animate-fadeIn"
            onClick={() => setSelectedBook(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold pr-8">
                    {selectedBook.volumeInfo.title}
                  </h2>
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="text-gray-500 hover:text-gray-700 flex-shrink-0"
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
                      <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="font-semibold">Autor:</span>
                        <span className="truncate">
                          {selectedBook.volumeInfo.authors?.join(", ") ||
                            "Desconocido"}
                        </span>
                      </div>

                      {selectedBook.volumeInfo.pageCount && (
                        <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
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

                      {selectedBook.saleInfo?.listPrice && (
                        <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                          <span className="font-semibold">Precio:</span>
                          <span>
                            {selectedBook.saleInfo.listPrice.amount}{" "}
                            {selectedBook.saleInfo.listPrice.currencyCode}
                          </span>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                          Sinopsis:
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                          {selectedBook.volumeInfo.description ||
                            "No hay sinopsis disponible."}
                        </p>
                      </div>

                      {selectedBook.volumeInfo.categories && (
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                            Categorías:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedBook.volumeInfo.categories.map(
                              (cat, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm"
                                >
                                  {cat}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                          Añadir a mi biblioteca:
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() =>
                              addToLibraryShelf(selectedBook, "wantToRead")
                            }
                            className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
                            className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
                            className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
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
                        className="flex items-center justify-center gap-2 w-full px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold text-sm sm:text-base"
                      >
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
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

        {showNewsletter && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowNewsletter(false)}
          >
            <div
              className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <h3 className="text-xl sm:text-2xl font-bold">Newsletter</h3>
                </div>
                <button
                  onClick={() => setShowNewsletter(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Recibe recomendaciones personalizadas de libros cada semana
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none mb-4 text-sm sm:text-base"
              />
              <button
                onClick={handleSubscribe}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm sm:text-base"
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
