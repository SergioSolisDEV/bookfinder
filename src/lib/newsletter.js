// src/lib/newsletter.js
import { supabase } from "./supabase";

/**
 * Agregar nuevo suscriptor al newsletter
 */
export const addNewsletterSubscriber = async (email) => {
  try {
    // Validación básica
    if (!email || !email.includes("@")) {
      return {
        success: false,
        error: "Email inválido",
      };
    }

    // Normalizar email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("email, status")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      // Si está activo, ya está suscrito
      if (existing.status === "active") {
        return {
          success: true,
          message: "Ya estás suscrito a nuestro newsletter",
          alreadyExists: true,
        };
      }

      // Si estaba dado de baja, reactivar
      if (existing.status === "unsubscribed") {
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({
            status: "active",
            subscribed_at: new Date().toISOString(),
          })
          .eq("email", normalizedEmail);

        if (updateError) throw updateError;

        return {
          success: true,
          message: "¡Bienvenido de nuevo! Has sido resuscrito.",
        };
      }
    }

    // Insertar nuevo suscriptor
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert([
        {
          email: normalizedEmail,
          source: "BookFinder Web",
          status: "active",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return {
      success: true,
      message: "¡Gracias por suscribirte! Recibirás nuestras novedades pronto.",
      data: data[0],
    };
  } catch (error) {
    console.error("Error adding subscriber:", error);

    // Manejo de errores específicos
    if (error.code === "23505") {
      // Unique violation
      return {
        success: true,
        message: "Ya estás suscrito",
        alreadyExists: true,
      };
    }

    return {
      success: false,
      error: "Error al procesar la suscripción. Por favor, intenta de nuevo.",
    };
  }
};

/**
 * Obtener todos los suscriptores activos (solo para admin)
 */
export const getAllSubscribers = async () => {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("status", "active")
      .order("subscribed_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting subscribers:", error);
    return [];
  }
};

/**
 * Obtener estadísticas de suscriptores
 */
export const getSubscriberStats = async () => {
  try {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("status");

    if (error) throw error;

    const stats = {
      total: data.length,
      active: data.filter((s) => s.status === "active").length,
      unsubscribed: data.filter((s) => s.status === "unsubscribed").length,
    };

    return stats;
  } catch (error) {
    console.error("Error getting stats:", error);
    return { total: 0, active: 0, unsubscribed: 0 };
  }
};

/**
 * Dar de baja un suscriptor
 */
export const unsubscribeEmail = async (email) => {
  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("email", email.toLowerCase().trim());

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing:", error);
    return {
      success: false,
      error: "Error al procesar la baja",
    };
  }
};

/**
 * Exportar suscriptores a CSV
 */
export const exportSubscribersToCSV = (subscribers) => {
  const headers = ["Email", "Fecha Suscripción", "Estado", "Fuente"];
  const rows = subscribers.map((sub) => [
    sub.email,
    new Date(sub.subscribed_at).toLocaleDateString("es-ES"),
    sub.status,
    sub.source || "N/A",
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
    "\n",
  );

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `bookfinder_subscribers_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
