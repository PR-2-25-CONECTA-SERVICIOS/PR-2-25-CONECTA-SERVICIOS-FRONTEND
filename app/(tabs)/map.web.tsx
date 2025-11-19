// app/(tabs)/map.web.tsx
import * as Location from "expo-location";
import { DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useMemo, useState } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import "/leaflet-fix.css";

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
   DATOS MOCK
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
   TEMA
========================== */
const palette = {
  light: {
    bg: "#F4F6FA",
    card: "#FFFFFF",
    text: "#0f1115",
    sub: "#6B7280",
    border: "#E5E7EB",
    overlay: "rgba(0,0,0,0.4)",
  },
  dark: {
    bg: "#0b0b0b",
    card: "#0f0f10",
    text: "#E5E7EB",
    sub: "#9CA3AF",
    border: "rgba(148,163,184,0.25)",
    overlay: "rgba(0,0,0,0.6)",
  },
} as const;

/* ==========================
   HELPERS LEAFLET
========================== */
function pinIcon(selected: boolean, available: boolean) {
  const size = selected ? 44 : 34;

  return new DivIcon({
    html: `
      <div style="
        position:relative;
        display:flex;
        align-items:center;
        justify-content:center;
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:#F59E0B;
        box-shadow:0 4px 10px rgba(0,0,0,.25);
      ">
        <svg width="${selected ? 22 : 18}" height="${selected ? 22 : 18}"
          viewBox="0 0 24 24" fill="none" stroke="#111827"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/* ==========================
   PUCK ICON
========================== */
const puckCSS = `
@keyframes pulse1 { 0%{transform:scale(.8);opacity:.45} 100%{transform:scale(1.5);opacity:0} }
@keyframes pulse2 { 0%{transform:scale(.9);opacity:.35} 100%{transform:scale(1.6);opacity:0} }

.leaflet-puck{
  width:80px;height:80px;
  display:flex;align-items:center;justify-content:center;
}
.leaflet-puck .glow{
  position:absolute;width:64px;height:64px;border-radius:999px;
  background:#F59E0B;opacity:.18;
}
.leaflet-puck .ring1{
  position:absolute;width:48px;height:48px;border-radius:999px;
  background:#F59E0B;animation:pulse1 1.4s linear infinite;
}
.leaflet-puck .ring2{
  position:absolute;width:40px;height:40px;border-radius:999px;
  background:#F59E0B;animation:pulse2 1.4s .4s linear infinite;
}
.leaflet-puck .dot{
  width:20px;height:20px;border-radius:999px;background:#FCD34D;
}
`;

function puckIcon() {
  return new DivIcon({
    html: `
      <div class="leaflet-puck">
        <div class="glow"></div>
        <div class="ring1"></div>
        <div class="ring2"></div>
        <div class="dot"></div>
      </div>
    `,
    className: "",
    iconSize: [80, 80],
    iconAnchor: [40, 40],
  });
}

/* ==========================
   FlyTo (Leaflet)
========================== */
function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 16, { duration: 0.6 });
  }, [center]);
  return null;
}

/* ==========================
   ESTILOS TIPADOS <--- CORRECCIÓN CRÍTICA
========================== */
const css = {
  screen: (t: any): React.CSSProperties => ({
    width: "100%",
    height: "100vh",
    position: "relative",
    background: t.bg,
  }),

  header: {
    position: "absolute" as const,
    top: 10,
    left: 10,
    right: 10,
    display: "flex",
    gap: 10,
    zIndex: 1000,
  },

  searchInput: (t: any): React.CSSProperties => ({
    flex: 1,
    padding: "10px",
    borderRadius: "12px",
    border: `1px solid ${t.border}`,
    background: t.card,
    color: t.text,
  }),

  listBtn: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "none",
    background: "#FBBF24",
    cursor: "pointer",
    fontWeight: 800,
  },

  mapWrap: {
    position: "absolute" as const,
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
  },

  legend: (t: any): React.CSSProperties => ({
    position: "absolute",
    right: 10,
    bottom: 90,
    background: t.card,
    padding: 10,
    borderRadius: "12px",
    border: `1px solid ${t.border}`,
    zIndex: 500,
  }),

  sheet: (t: any): React.CSSProperties => ({
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    background: t.card,
    borderRadius: "16px",
    border: `1px solid ${t.border}`,
    padding: 14,
    boxShadow: "0 8px 20px rgba(0,0,0,.25)",
    zIndex: 500,
  }),

  overlay: (t: any): React.CSSProperties => ({
    position: "fixed",
    inset: 0,
    background: t.overlay,
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 2000,
  }),

  modal: (t: any): React.CSSProperties => ({
    width: "100%",
    background: t.card,
    borderTopLeftRadius: "18px",
    borderTopRightRadius: "18px",
    maxHeight: "60%",
    overflowY: "auto",
    paddingBottom: 20,
  }),

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: 14,
  },

  listItem: (t: any): React.CSSProperties => ({
    padding: 12,
    borderBottom: `1px solid ${t.border}`,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
  }),
};

/* ==========================
   COMPONENTE PRINCIPAL
========================== */
export default function MapWeb() {
  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const t = isDark ? palette.dark : palette.light;

  const initial = useMemo(
    () => [-17.3835, -66.163] as [number, number],
    []
  );

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProviderItem | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const [followMe, setFollowMe] = useState(false);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [flyTo, setFlyTo] = useState<[number, number] | null>(null);

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

  /* Seguimiento ubicación */
  React.useEffect(() => {
    let sub: any;
    (async () => {
      if (!followMe) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const curr = await Location.getCurrentPositionAsync({});
      const c: [number, number] = [
        curr.coords.latitude,
        curr.coords.longitude,
      ];
      setUserLoc(c);
      setFlyTo(c);

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 1500 },
        ({ coords }) => {
          const d: [number, number] = [
            coords.latitude,
            coords.longitude,
          ];
          setUserLoc(d);
          setFlyTo(d);
        }
      );
    })();

    return () => sub?.remove();
  }, [followMe]);

  return (
    <div style={css.screen(t)}>
      {/* CSS del puck */}
      <style>{puckCSS}</style>

      {/* ---------------- HEADER ---------------- */}
      <div style={css.header}>
        <input
          placeholder="Buscar en el mapa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={css.searchInput(t)}
        />

        <button
          style={css.listBtn}
          onClick={() => setListOpen(true)}
        >
          Lista
        </button>

        <button
          style={{
            ...css.listBtn,
            background: followMe ? "#F59E0B" : "#FBBF24",
          }}
          onClick={() => setFollowMe((v) => !v)}
        >
          {followMe ? "Siguiéndote" : "Mi ubicación"}
        </button>
      </div>

      {/* ---------------- MAPA ---------------- */}
      <div style={css.mapWrap}>
        <MapContainer
          center={initial}
          zoom={15}
          zoomControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          {isDark ? (
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          ) : (
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          )}

          {flyTo && <FlyTo center={flyTo} />}

          {MOCK.map((m) => (
            <Marker
              key={m.id}
              position={[m.coord.latitude, m.coord.longitude]}
              icon={pinIcon(selected?.id === m.id, m.status === "available")}
              eventHandlers={{
                click: () => setSelected(m),
              }}
            >
              <Popup>
                <b>{m.title}</b>
                <br />
                {m.category}
              </Popup>
            </Marker>
          ))}

          {userLoc && <Marker position={userLoc} icon={puckIcon()} />}
        </MapContainer>
      </div>

      {/* ---------------- LEYENDA ---------------- */}
      <div style={css.legend(t)}>
        <div style={{ color: t.text, fontWeight: 800, marginBottom: 6 }}>
          Leyenda
        </div>

        <LegendRow color="#F59E0B" label="Disponible" />
        <LegendRow color="#9CA3AF" label="No disponible" />
        <LegendRow color="#FCD34D" label="Tu ubicación" />
      </div>

      {/* ---------------- BOTTOM SHEET ---------------- */}
      {selected && (
        <div style={css.sheet(t)}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ color: t.text, fontWeight: 900 }}>
                {selected.title}
              </div>
              <div style={{ color: t.sub }}>{selected.category}</div>
            </div>

            <button
              onClick={() => setSelected(null)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ✖
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            ⭐ {selected.rating} — {selected.price}
          </div>

          <button style={css.listBtn}>Solicitar Servicio</button>
        </div>
      )}

      {/* ---------------- LISTA MODAL ---------------- */}
      {listOpen && (
        <div style={css.overlay(t)}>
          <div style={css.modal(t)}>
            <div style={css.modalHeader}>
              <span style={{ color: t.text, fontWeight: 900 }}>
                Resultados
              </span>

              <button
                onClick={() => setListOpen(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ✖
              </button>
            </div>

            {filtered.map((item) => (
              <div
                key={item.id}
                style={css.listItem(t)}
                onClick={() => {
                  setSelected(item);
                  setFlyTo([item.coord.latitude, item.coord.longitude]);
                  setListOpen(false);
                }}
              >
                <div>
                  <div style={{ color: t.text, fontWeight: 800 }}>
                    {item.title}
                  </div>
                  <div style={{ color: t.sub }}>{item.category}</div>
                </div>

                <div style={{ color: t.text, fontWeight: 800 }}>
                  {item.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================
   SUBCOMPONENTES
========================== */
function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginTop: 6,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "999px",
          background: color,
          marginRight: 8,
        }}
      />
      <span style={{ color: "#AEB4BE", fontSize: 12 }}>{label}</span>
    </div>
  );
}
