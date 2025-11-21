"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";

/* ==========================
   TIPOS
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
   MOCK DATA
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
   COMPONENTE PRINCIPAL
========================== */
export default function MapWeb() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const [selected, setSelected] = useState<ProviderItem | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);

const initialCenter: [number, number] = [-66.163, -17.3835];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
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

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: initialCenter,
      zoom: 15,
    });

    // markers
    MOCK.forEach((item) => {
      const el = document.createElement("div");
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.background =
        item.status === "available" ? "#F59E0B" : "#9CA3AF";
      el.style.border = "2px solid white";
      el.style.cursor = "pointer";

      el.onclick = () => {
        setSelected(item);
        mapRef.current?.flyTo({
          center: [item.coord.longitude, item.coord.latitude],
          zoom: 16,
          speed: 0.8,
        });
      };

      new maplibregl.Marker({ element: el })
        .setLngLat([item.coord.longitude, item.coord.latitude])
        .addTo(mapRef.current!);
    });
  }, []);

  /* ==========================
     Ubicación del usuario
  =========================== */
  const locateUser = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        setUserLoc([c[1], c[0]]);

        new maplibregl.Marker({
          color: "#FCD34D",
        })
          .setLngLat([c[0], c[1]])
          .addTo(mapRef.current!);

        mapRef.current?.flyTo({
          center: [c[0], c[1]],
          zoom: 16,
          speed: 0.8,
        });
      },
      (err) => console.log("Error GPS:", err),
      { enableHighAccuracy: true }
    );
  };

  /* ==========================
     RENDER
  =========================== */
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          right: 10,
          display: "flex",
          gap: 10,
          zIndex: 10,
        }}
      >
        <input
          placeholder="Buscar en mapa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={() => setListOpen(true)}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#FBBF24",
            fontWeight: "bold",
            border: "none",
          }}
        >
          Lista
        </button>

        <button
          onClick={locateUser}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            background: "#60A5FA",
            fontWeight: "bold",
            border: "none",
          }}
        >
          Mi Ubicación
        </button>
      </div>

      {/* MAP */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* INFO CARD */}
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            right: 10,
            background: "white",
            padding: 16,
            borderRadius: 12,
            boxShadow: "0px 4px 14px rgba(0,0,0,0.25)",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0 }}>{selected.title}</h3>
              <span>{selected.category}</span>
            </div>

            <button
              onClick={() => setSelected(null)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 20,
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
            background: "rgba(0,0,0,0.4)",
            zIndex: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              width: "100%",
              background: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "60%",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0 }}>Resultados</h3>

              <button
                onClick={() => setListOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 20,
                }}
              >
                ✖
              </button>
            </div>

            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelected(item);
                  setListOpen(false);
                }}
                style={{
                  padding: 16,
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong>{item.title}</strong>
                  <div style={{ color: "#555" }}>{item.category}</div>
                </div>

                <div style={{ fontWeight: "bold" }}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
