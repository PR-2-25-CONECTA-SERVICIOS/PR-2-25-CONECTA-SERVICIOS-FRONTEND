"use client";

import { ArrowLeft } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
/* ==========================
   Paleta estilo móvil/dark
========================== */
const palette = {
  dark: {
    bg: "#0B0F19",
    card: "#111827",
    text: "#FFFFFF",
    sub: "#9CA3AF",
    border: "#2C354A",
    chip: "#FBBF24",
    pin: "#F59E0B",
    pinInactive: "#9CA3AF",
    user: "#FCD34D",
    overlay: "rgba(0,0,0,0.50)",
  },
};

/* ==========================
   API
========================== */
const API_URL = "http://192.168.0.6:3000/api/locales";

/* ==========================
   Tipo del local
========================== */
type ProviderItem = {
  id: string;
  title: string;
  category: string;
  coord: { latitude: number; longitude: number };
  rating: number;
  price: string;
  status: "available" | "unavailable";
  image?: string;
};

/* ==========================
   Mapper DB → Mapa
========================== */
function mapLocalToItem(local: any): ProviderItem {
  const lat = Number(local.lat);
  const lng = Number(local.lng);

  return {
    id: local._id,
    title: local.nombre,
    category: local.categoria,
    coord: {
      latitude: isNaN(lat) ? -17.3835 : lat,
      longitude: isNaN(lng) ? -66.163 : lng,
    },
    rating: local.calificacion ?? 0,
    price: local.distancia ?? "Sin info",
    status: local.destacado ? "available" : "unavailable",
    image: local.imagen,
  };
}

/* ==========================
   COMPONENTE PRINCIPAL
========================== */
export default function MapWeb() {
  const t = palette.dark;

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [locales, setLocales] = useState<ProviderItem[]>([]);
  const [selected, setSelected] = useState<ProviderItem | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [slideOpen, setSlideOpen] = useState(false);

  const center: [number, number] = [-66.163, -17.3835];

  /* ==========================
     Cargar datos del backend
  =========================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setLocales(data.map(mapLocalToItem));
      } catch (err) {
        console.log("❌ Error cargando locales:", err);
      }
    })();
  }, []);

  /* ==========================
     Inicializar mapa
  =========================== */
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center,
      zoom: 15,
    });

    mapRef.current = map;
  }, []);

  /* ==========================
     Filtro de búsqueda
  =========================== */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return locales.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [search, locales]);

  /* ==========================
     Pintar marcadores dependiendo del filtro
  =========================== */
  useEffect(() => {
    if (!mapRef.current) return;

    // 🔥 borrar marcadores antiguos
    const olds = document.querySelectorAll(".custom-marker");
    olds.forEach((m) => m.remove());

    // 🔥 dibujar solo filtrados
    filtered.forEach((item) => {
      const lat = item.coord.latitude;
      const lng = item.coord.longitude;
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = document.createElement("div");
      marker.className = "custom-marker";
      marker.style.width = "34px";
      marker.style.height = "34px";
      marker.style.borderRadius = "999px";
      marker.style.cursor = "pointer";
      marker.style.display = "flex";
      marker.style.alignItems = "center";
      marker.style.justifyContent = "center";
      marker.style.background =
        item.status === "available" ? t.pin : t.pinInactive;

      marker.innerHTML = `
        <svg width="18" height="18" fill="#111827" viewBox="0 0 24 24">
          <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13
          c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5
          s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      marker.onclick = () => {
        setSelected(item);
        setSlideOpen(true);

        mapRef.current!.flyTo({
          center: [lng, lat],
          zoom: 16,
          speed: 0.7,
        });
      };

      new maplibregl.Marker({ element: marker })
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);
    });
  }, [filtered]);
  function BackBtn({ onClick }: { onClick: () => void }) {
    return (
      <div
        onClick={onClick}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "rgba(17,24,39,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "1px solid rgba(148,163,184,0.2)",
        }}
      >
        <ArrowLeft size={18} color="#e5e7eb" />
      </div>
    );
  }

  /* ==========================
     UI
  =========================== */
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: t.bg,
        position: "relative",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* 🔙 BOTÓN + BUSCADOR */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <BackBtn onClick={() => (window.location.href = "/LocalesScreen")} />

          {/* 🔍 Input */}
          <div
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "#111827",
              borderRadius: 14,
              border: `1px solid rgba(148,163,184,0.3)`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <input
              placeholder="Buscar en el mapa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#fff",
                outline: "none",
                fontSize: 14,
              }}
            />
          </div>
        </div>

        {/* BOTONES */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setListOpen(true)}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: "#FBBF24",
              color: "#111827",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Lista
          </button>

          <button
            onClick={() => alert("Ubicación desactivada en web")}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: "#FBBF24",
              color: "#111827",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Mi ubicación
          </button>
        </div>
      </div>

      {/* MAP */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* TARJETA DESLIZABLE */}
      {selected && (
        <>
          {/* OVERLAY */}
          <div
            onClick={() => setSlideOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: slideOpen ? t.overlay : "transparent",
              transition: "0.25s ease",
              zIndex: 80,
              pointerEvents: slideOpen ? "auto" : "none",
            }}
          />

          {/* CARD */}
          <div
            style={{
              position: "fixed",
              bottom: slideOpen ? "0px" : "-350px",
              left: 0,
              right: 0,
              height: "330px",
              background: t.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              zIndex: 100,
              padding: 16,
              transition: "bottom 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)",
            }}
          >
            {selected.image && (
              <img
                src={selected.image}
                style={{
                  width: "100%",
                  height: "140px",
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
            )}

            <h3 style={{ marginTop: 10 }}>{selected.title}</h3>
            <p style={{ margin: "4px 0", color: t.sub }}>{selected.category}</p>

            <p style={{ margin: "6px 0", color: t.text }}>
              ⭐ {selected.rating} — {selected.price}
            </p>

            <button
              onClick={() => setSlideOpen(false)}
              style={{
                marginTop: 10,
                width: "100%",
                padding: "10px",
                background: "#222",
                borderRadius: 10,
                color: t.sub,
                border: "none",
                cursor: "pointer",
              }}
            >
              Cerrar
            </button>
          </div>
        </>
      )}

      {/* LISTA */}
      {listOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: t.overlay,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            zIndex: 80,
          }}
        >
          <div
            style={{
              width: "100%",
              maxHeight: "65%",
              background: t.card,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflowY: "auto",
              paddingBottom: 14,
            }}
          >
            <div
              style={{
                padding: 16,
                color: t.text,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Resultados</h3>

              <button
                onClick={() => setListOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: t.sub,
                  fontSize: 22,
                  cursor: "pointer",
                }}
              >
                ✖
              </button>
            </div>

            {filtered.map((i) => (
              <div
                key={i.id}
                onClick={() => {
                  setSelected(i);
                  setListOpen(false);
                  setSlideOpen(true);
                }}
                style={{
                  padding: 16,
                  borderBottom: `1px solid ${t.border}`,
                  color: t.text,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong>{i.title}</strong>
                  <p style={{ margin: 0, color: t.sub }}>{i.category}</p>
                </div>
                <strong>{i.price}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
