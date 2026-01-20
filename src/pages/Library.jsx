import React, { useState, useEffect } from "react";
import {
  Library as LibraryIcon,
  BookOpen,
  BookOpenCheck,
  Clock,
  X,
  ExternalLink,
  DollarSign,
  User,
  Mail,
} from "lucide-react";
import Header from "../components/Header";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
  getLibrary,
  addToLibrary,
  removeFromLibrary,
} from "../lib/database";

function Library() {
  const { user } = useAuth();
  const [library, setLibrary] = useState({
    wantToRead: [],
    reading: [],
    read: [],
  });
  const [activeTab, setActiveTab] = useState("wantToRead");
  const [selectedBook, setSelectedBook] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [email, setEmail] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [lib, favs] = await Promise.all([
        getLibrary(user.id),
        getFavorites(user.id),
      ]);
      setLibrary(lib);
      setFavorites(favs);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "wantToRead",
      label: "Quiero Leer",
      icon: BookOpen,
      count: library.wantToRead.length,
    },
    {
      id: "reading",
      label: "Leyendo",
      icon: Clock,
      count: library.reading.length,
    },
    {
      id: "read",
      label: "Leídos",
      icon: BookOpenCheck,
      count: library.read.length,
    },
  ];

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
    }
  };

  const isFavorite = (book) => {
    return favorites.some((fav) => fav.id === book.id);
  };

  const addToLibraryShelf = async (book, shelf) => {
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

        if (selectedBook && selectedBook.id === book.id) {
          setSelectedBook(null);
        }
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
    }
  };

  const getBookShelf = (book) => {
    if (library.wantToRead.some((b) => b.id === book.id)) return "wantToRead";
    if (library.reading.some((b) => b.id === book.id)) return "reading";
    if (library.read.some((b) => b.id === book.id)) return "read";
    return null;
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

  const currentBooks = library[activeTab];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando biblioteca...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>Mi Biblioteca - BookFinder</title>
      <meta
        name="description"
        content="Organiza tus libros por estado de lectura: quiero leer, leyendo y leídos."
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <LibraryIcon className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                Mi Biblioteca
              </h1>
            </div>
            <p className="text-gray-600">
              Organiza tus libros por estado de lectura
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="flex border-b overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-purple-50 text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id ? "bg-purple-200" : "bg-gray-200"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {currentBooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No hay libros en esta categoría
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Empieza a explorar y añade libros a tu biblioteca
                  </p>
                  <a
                    href="/"
                    className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                  >
                    Explorar Libros
                  </a>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onClick={setSelectedBook}
                      isFavorite={isFavorite(book)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {selectedBook && (
          <div
            className="animate-fadeIn fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedBook(null)}
          >
            <div
              className="animate-scaleIn bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold pr-8">
                    {selectedBook.volumeInfo.title}
                  </h2>
                  <button
                    onClick={() => setSelectedBook(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
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
                    <div className="space-y-4">
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

                      {selectedBook.saleInfo?.listPrice && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="w-5 h-5" />
                          <span className="font-semibold">Precio:</span>
                          <span>
                            {selectedBook.saleInfo.listPrice.amount}{" "}
                            {selectedBook.saleInfo.listPrice.currencyCode}
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

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">
                          Estado de lectura:
                        </h3>
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

export default Library;
