import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Mail,
  Lock,
  BookOpen,
  AlertCircle,
  CheckCircle,
  User,
  Loader2,
} from "lucide-react";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Normalizar datos
    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    // ====================================
    // VALIDACIONES BÁSICAS
    // ====================================

    if (!normalizedUsername) {
      setError("El nombre de usuario es obligatorio");
      setLoading(false);
      return;
    }

    if (normalizedUsername.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres");
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
      setError(
        "El nombre de usuario solo puede contener letras, números y guiones bajos",
      );
      setLoading(false);
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Ingresa un email válido");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      // ====================================
      // VERIFICAR EMAIL ÚNICO usando función SQL
      // ====================================
      const { data: emailExists, error: emailCheckError } = await supabase.rpc(
        "check_email_exists",
        { check_email: normalizedEmail },
      );

      if (emailCheckError) {
        console.error("Error verificando email:", emailCheckError);
        // Si la función no existe, continuar sin verificación
      } else if (emailExists) {
        setError("Este email ya está registrado");
        setLoading(false);
        return;
      }

      // ====================================
      // VERIFICAR USERNAME ÚNICO
      // ====================================
      const { data: existingUsername, error: usernameCheckError } =
        await supabase
          .from("profiles")
          .select("username")
          .eq("username", normalizedUsername)
          .maybeSingle();

      if (usernameCheckError && usernameCheckError.code !== "PGRST116") {
        throw usernameCheckError;
      }

      if (existingUsername) {
        setError("Este nombre de usuario ya está en uso");
        setLoading(false);
        return;
      }

      // ====================================
      // REGISTRAR USUARIO EN SUPABASE AUTH
      // ====================================
      console.log("🔐 Intentando crear usuario en auth...");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: password,
        options: {
          data: {
            username: normalizedUsername,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      console.log("✅ Auth data:", authData);
      console.log("❌ Auth error:", authError);

      if (authError) {
        console.error("Error en auth.signUp:", authError);

        // Manejar errores específicos de Auth
        if (authError.message.includes("User already registered")) {
          setError("Este email ya está registrado");
          setLoading(false);
          return;
        }
        if (authError.message.includes("already been registered")) {
          setError("Este email ya está registrado");
          setLoading(false);
          return;
        }
        throw authError;
      }

      if (!authData.user) {
        console.error("❌ No se creó el usuario en auth");
        throw new Error("No se pudo crear el usuario");
      }

      console.log("✅ Usuario creado en auth con ID:", authData.user.id);

      // ====================================
      // HACER LOGIN PARA OBTENER SESIÓN
      // ====================================
      console.log("🔐 Haciendo login para obtener sesión...");

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password,
        });

      if (signInError) {
        console.error("Error en signIn:", signInError);
        throw signInError;
      }

      console.log("✅ Sesión creada:", signInData.session ? "Sí" : "No");

      // ====================================
      // CREAR PERFIL EN TABLA PROFILES
      // ====================================
      console.log("📝 Creando perfil en tabla profiles...");

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          email: normalizedEmail,
          username: normalizedUsername,
          created_at: new Date().toISOString(),
        },
      ]);

      console.log("❌ Profile error:", profileError);

      if (profileError) {
        console.error("Error creando perfil:", profileError);
        throw new Error("Error al crear el perfil de usuario");
      }

      console.log("✅ Perfil creado exitosamente");

      // ====================================
      // ÉXITO
      // ====================================
      setSuccess(true);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error en registro:", error);

      // Manejo de errores específicos
      if (error.message?.includes("User already registered")) {
        setError("Este email ya está registrado");
      } else if (error.message?.includes("duplicate key")) {
        if (error.message.includes("email")) {
          setError("Este email ya está registrado");
        } else if (error.message.includes("username")) {
          setError("Este nombre de usuario ya está en uso");
        } else {
          setError("Este usuario ya existe");
        }
      } else {
        setError(
          error.message || "Error al crear la cuenta. Intenta de nuevo.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <BookOpen className="w-10 h-10 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            BookFinder
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Crear Cuenta
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Únete y empieza a organizar tu biblioteca
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">
              ¡Cuenta creada exitosamente! Redirigiendo...
            </p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* USERNAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de Usuario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="usuario123"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition"
                required
                minLength={3}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Solo letras, números y guiones bajos. Mínimo 3 caracteres.
            </p>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-purple-600 hover:text-purple-700 font-semibold transition"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
