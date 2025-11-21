"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";

/* ==========================
   Tipos
========================== */
type ProviderItem = {
  id: number;
  title: string;
  category: string;
  coord: { latitude: number; longitude: number };
  rating: number;
  price: string;
  status: "available" | "unavailable";
};

/* ==========================
   Mock data
========================== */
const MOCK: ProviderItem[] = [
  {
    id: 1,
    title: "Plomería Express",
    category: "Plomería",
    coord: { latitude: -17.382, longitude: -66.1635 },
    rating: 4.8,
    price: "$50-80/h",
    status: "available",
  },
  {
    id: 2,
    title: "Limpieza ProClean",
    category: "Limpieza",
    coord: { latitude: -17.3845, longitude: -66.159 },
    rating: 4.9,
    price: "$40-60/h",
    status: "unavailable",
  },
  {
    id: 3,
    title: "Delivery Rápido",
    category: "Delivery",
    coord: { latitude: -17.387, longitude: -66.1655 },
    rating: 4.7,
    price: "$12/envío",
    status: "available",
  },
  {
    id: 4,
    title: "Restaurante La Casa",
    category: "Restaurante",
    coord: { latitude: -17.3805, longitude: -66.1675 },
    rating: 4.5,
    price: "$15-30",
    status: "available",
  },
];

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
   COMPONENTE PRINCIPAL
========================== */
export default function MapWeb() {
  const t = palette.dark;

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [selected, setSelected] = useState<ProviderItem | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

  const center: [number, number] = [-66.163, -17.3835];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return MOCK;

    return MOCK.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.price.toLowerCase().includes(q)
    );
  }, [search]);

  /* ==========================
     Inicializar mapa
  =========================== */
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center,
      zoom: 15,
    });

    mapRef.current = map;

    /* ===== AGREGAR MARCADORES ===== */
    MOCK.forEach((item) => {
      const marker = document.createElement("div");
      marker.style.width = "34px";
      marker.style.height = "34px";
      marker.style.borderRadius = "999px";
      marker.style.cursor = "pointer";
      marker.style.display = "flex";
      marker.style.alignItems = "center";
      marker.style.justifyContent = "center";

      // Fondo circular
      marker.style.background =
        item.status === "available" ? t.pin : t.pinInactive;

      // Icono central
      marker.innerHTML =
        `<svg width="18" height="18" fill="#111827" viewBox="0 0 24 24">
          <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 
          0-2.5-1.12-2.5-2.5s1.12-2.5 
          2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`;

      // Captura clics sin bug
      marker.addEventListener("click", () => {
        setSelected(item);
        map.flyTo({
          center: [item.coord.longitude, item.coord.latitude],
          zoom: 16,
          speed: 0.7,
        });
      });

      new maplibregl.Marker({ element: marker })
        .setLngLat([item.coord.longitude, item.coord.latitude])
        .addTo(map);
    });
  }, []);

  /* ==========================
     Ubicación del usuario
  =========================== */
  const locateUser = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;

        setUserLoc([lat, lng]);

        new maplibregl.Marker({
          color: t.user,
        })
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);

        mapRef.current?.flyTo({
          center: [lng, lat],
          zoom: 16,
          speed: 0.7,
        });
      },
      () => {},
      { enableHighAccuracy: true }
    );
  };

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
          gap: 12,
        }}
      >
        {/* Search */}
        <div
          style={{
            padding: "10px 14px",
            background: "#111827",
            borderRadius: 14,
            display: "flex",
            border: `1px solid ${t.border}`,
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
              color: t.text,
              outline: "none",
            }}
          />
          <svg
            width="20"
            height="20"
            fill={t.sub}
            viewBox="0 0 24 24"
            style={{ marginLeft: 8 }}
          >
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 
            0016 9.5 6.5 6.5 0 109.5 
            16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 
            4.99L20.49 19l-4.99-5zm-6 
            0C7.01 14 5 11.99 5 9.5S7.01 5 
            9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setListOpen(true)}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: t.chip,
              color: "#111827",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Lista
          </button>

          <button
            onClick={locateUser}
            style={{
              padding: "10px 18px",
              borderRadius: 12,
              background: t.chip,
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

      {/* BOTTOM CARD — DETALLE */}
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 16,
            right: 16,
            background: t.card,
            borderRadius: 16,
            padding: 16,
            color: t.text,
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            zIndex: 60,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0 }}>{selected.title}</h3>
              <p style={{ marginTop: 4, color: t.sub }}>
                {selected.category}
              </p>
            </div>

            <button
              onClick={() => setSelected(null)}
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

          <p style={{ marginTop: 10 }}>
            ⭐ {selected.rating} — {selected.price}
          </p>
        </div>
      )}

      {/* LISTA MODAL */}
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

      {/* LEYENDA */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          background: t.card,
          borderRadius: 12,
          padding: 12,
          border: `1px solid ${t.border}`,
          color: t.text,
          fontSize: 14,
          boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
        }}
      >
        <strong style={{ fontSize: 15 }}>Leyenda</strong>
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <Legend color={t.pin} label="Disponible" />
          <Legend color={t.pinInactive} label="No disponible" />
          <Legend color={t.user} label="Tu ubicación" />
        </div>
      </div>
    </div>
  );
}

/* ==========================
   Subcomponente Leyenda
========================== */
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: 99,
          background: color,
        }}
      ></div>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}
