// src/components/AdSenseBanner.jsx
import React, { useEffect } from "react";

const AdSenseBanner = ({
  slot, // CAMBIADO: adSlot → slot
  format = "auto", // CAMBIADO: adFormat → format
  responsive = true, // CAMBIADO: fullWidthResponsive → responsive
  style = {}, // AÑADIDO: para estilos personalizados
  className = "",
}) => {
  useEffect(() => {
    try {
      // Solo cargar en producción
      if (window.adsbygoogle && process.env.NODE_ENV === "production") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  // Mostrar placeholder en desarrollo
  if (process.env.NODE_ENV !== "production") {
    return (
      <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-8 text-center">
        <p className="text-gray-600 font-semibold">AdSense Banner</p>
        <p className="text-xs text-gray-500 mt-2">Solo visible en producción</p>
        <p className="text-xs text-gray-400 mt-1">Slot ID: {slot}</p>
        <p className="text-xs text-gray-400">Format: {format}</p>
      </div>
    );
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-9119985572931576" // ACTUALIZADO: tu ID real
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

export default AdSenseBanner;
