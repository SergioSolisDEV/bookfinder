import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { User, BookOpen, Heart, BarChart3, Mail, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { getFavorites, getLibrary } from "../lib/database";
import { supabase } from "../lib/supabase";

function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    favorites: 0,
    wantToRead: 0,
    reading: 0,
    read: 0,
    totalBooks: 0,
  });
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      // Obtener username del perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, email")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username);
      }

      // Obtener estadísticas
      const [favorites, library] = await Promise.all([
        getFavorites(user.id),
        getLibrary(user.id),
      ]);

      setStats({
        favorites: favorites.length,
        wantToRead: library.wantToRead.length,
        reading: library.reading.length,
        read: library.read.length,
        totalBooks:
          library.wantToRead.length +
          library.reading.length +
          library.read.length,
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mi Perfil - BookFinder</title>
        <meta
          name="description"
          content="Visualiza tus estadísticas de lectura y el progreso de tu biblioteca personal."
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
            </div>
            <p className="text-gray-600">
              Tus estadísticas de lectura y actividad
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  @{username}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Miembro desde{" "}
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <Heart className="w-8 h-8 text-purple-600" />
                  <span className="text-3xl font-bold text-purple-600">
                    {stats.favorites}
                  </span>
                </div>
                <h3 className="text-gray-700 font-semibold">Favoritos</h3>
                <p className="text-gray-600 text-sm">Libros que te encantan</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-600">
                    {stats.wantToRead}
                  </span>
                </div>
                <h3 className="text-gray-700 font-semibold">Quiero Leer</h3>
                <p className="text-gray-600 text-sm">En tu lista de deseos</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-orange-600" />
                  <span className="text-3xl font-bold text-orange-600">
                    {stats.reading}
                  </span>
                </div>
                <h3 className="text-gray-700 font-semibold">Leyendo</h3>
                <p className="text-gray-600 text-sm">Lecturas actuales</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                  <span className="text-3xl font-bold text-green-600">
                    {stats.read}
                  </span>
                </div>
                <h3 className="text-gray-700 font-semibold">Leídos</h3>
                <p className="text-gray-600 text-sm">Libros completados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Resumen de Actividad
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-700">
                  Total de libros en biblioteca
                </span>
                <span className="font-bold text-purple-600">
                  {stats.totalBooks}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-700">Libros favoritos</span>
                <span className="font-bold text-purple-600">
                  {stats.favorites}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-700">Progreso de lectura</span>
                <span className="font-bold text-purple-600">
                  {stats.totalBooks > 0
                    ? `${Math.round((stats.read / stats.totalBooks) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>
        </main>

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

export default Profile;
