import React, { useEffect } from "react";

const AdSenseInFeed = ({ adSlot }) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className="bg-gray-50 rounded-xl p-4 my-4 border border-gray-200">
      <p className="text-xs text-gray-500 mb-2">Publicidad</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-ad-client="ca-pub-XXXXXXXXXX"
        data-ad-slot={adSlot}
      />
    </div>
  );
};

export default AdSenseInFeed;
