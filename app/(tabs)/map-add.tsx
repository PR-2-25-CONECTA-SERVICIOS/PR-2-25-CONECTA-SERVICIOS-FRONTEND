// app/(tabs)/map-add.web.tsx
"use client";
import { router } from "expo-router";

import {
  ArrowLeft,
  Camera,
  ImagePlus,
  List,
  Save,
  Trash2,
  X,
} from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { loadUserSession } from "../../utils/secureStore";

// 🔗 Backend
const API_URL = "http://localhost:3000/api/locales";

// 🔗 Cloudinary
const CLOUDINARY_URL =
  "https://api.cloudinary.com/v1_1/deqxfxbaa/image/upload";
const CLOUDINARY_PRESET = "imagescloudexp";

// Categorías disponibles
const CATEGORIES = [
  "Restaurante",
  "Tienda",
  "Farmacia",
  "Servicios",
  "Otro",
  "General",
] as const;

type Category = (typeof CATEGORIES)[number];

type Place = {
  id: string;
  title: string;
  phone: string;
  description: string;
  imageUri?: string;
  coord: { latitude: number; longitude: number };
  category: Category | string;
  createdAt: number;
};

// 🔁 Mapper del Local de Mongo → Place del mapa
function mapLocalToPlace(local: any): Place {
  return {
    id: local._id,
    title: local.nombre ?? "",
    phone: local.telefono ?? "",
    description: local.direccion ?? "",
    imageUri: local.imagen,
    category: local.categoria ?? "General",
    coord: {
      latitude: local.lat ?? -17.3835,
      longitude: local.lng ?? -66.163,
    },
    createdAt: local.createdAt
      ? new Date(local.createdAt).getTime()
      : Date.now(),
  };
}

// Estilo oscuro tipo “dark matter”
const DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapAdd() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});

  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // ⚠️ SOLO locales creados en ESTA pantalla (no se cargan de la BD)
  const [places, setPlaces] = useState<Place[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [draftCoord, setDraftCoord] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<Category | string>("General");

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // =====================================================
  // 1. Cargar SOLO el usuario actual (ya no carga locales)
  // =====================================================
  useEffect(() => {
    (async () => {
      try {
        const user = await loadUserSession();
        if (!user || !user._id) {
          console.log("No hay usuario en sesión (MapAdd web)");
          return;
        }
        setCurrentUser(user);
      } catch (e) {
        console.warn(
          "No se pudo cargar el usuario en MapAdd web",
          e
        );
      }
    })();
  }, []);

  // =====================================================
  // 2. Inicializar mapa (vacío, estilo local sin POIs)
  // =====================================================
  useEffect(() => {
    if (!mapContainer.current) return;

    const loadStyle = async () => {
      const styleRes = await fetch(DARK_STYLE);
      const styleJson = await styleRes.json();

      // Eliminamos POIs, labels, landuse, buildings
      styleJson.layers = styleJson.layers.filter(
        (layer: any) =>
          !layer.id.includes("poi") &&
          !layer.id.includes("poi_label") &&
          !layer.id.includes("landuse") &&
          !layer.id.includes("building")
      );

      // Congelamos como estilo local
      styleJson.sources = JSON.parse(JSON.stringify(styleJson.sources));
      styleJson.layers = JSON.parse(JSON.stringify(styleJson.layers));

      const initialCenter: [number, number] = [-66.163, -17.3835];

      map.current = new maplibregl.Map({
container: mapContainer.current as HTMLElement,
        style: styleJson,
        center: initialCenter,
        zoom: 14.5,
      });

      // Evento para crear local
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        setDraftCoord({ latitude: lat, longitude: lng });
        setTitle("");
        setPhone("");
        setDescription("");
        setImageUri(undefined);
        setCategory("General");
        setEditingId(null);
        setFormOpen(true);
        setDetailOpen(false);
      });
    };

    loadStyle();

    return () => map.current?.remove();
  }, []);

  // =====================================================
  // 3. Pintar markers SOLO de los locales creados aquí
  //    (pero tú quieres que no se vea nada del backend,
  //    aquí solo aparecen los de esta sesión)
  // =====================================================
  useEffect(() => {
    if (!map.current) return;

    // limpiar anteriores
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    places.forEach((p) => {
      const el = document.createElement("div");
      el.style.width = "26px";
      el.style.height = "26px";
      el.style.borderRadius = "999px";
      el.style.background = "#F59E0B";
      el.style.boxShadow = "0 0 0 2px #0b0b0b";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.cursor = "pointer";
      el.style.position = "relative";

      const dot = document.createElement("div");
      dot.style.position = "absolute";
      dot.style.width = "8px";
      dot.style.height = "8px";
      dot.style.borderRadius = "999px";
      dot.style.background = "#FCD34D";
      dot.style.right = "-3px";
      dot.style.top = "-3px";
      el.appendChild(dot);

      // círculo interior
      const inner = document.createElement("div");
      inner.style.width = "12px";
      inner.style.height = "12px";
      inner.style.borderRadius = "999px";
      inner.style.background = "#111827";
      el.appendChild(inner);

      el.onclick = () => {
        setSelected(p);
        setDetailOpen(true);
        flyTo(p);
      };

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.coord.longitude, p.coord.latitude])
        .addTo(map.current!);

      markersRef.current[p.id] = marker;
    });
  }, [places]);

  const flyTo = (p: Place) => {
    map.current?.flyTo({
      center: [p.coord.longitude, p.coord.latitude],
      zoom: 16,
      speed: 0.8,
    });
  };

  // =====================================================
  // 4. Cloudinary (subir imagen)
  // =====================================================
  const uploadImageToCloudinary = async (file: File) => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_PRESET);

      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.secure_url) {
        return json.secure_url as string;
      }
      console.log("Respuesta Cloudinary inesperada:", json);
      return null;
    } catch (err) {
      console.log("ERROR CLOUDINARY LOCAL (web):", err);
      return null;
    }
  };

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview rápida local (opcional)
    const localUrl = URL.createObjectURL(file);
    setImageUri(localUrl);

    const cloudUrl = await uploadImageToCloudinary(file);
    if (cloudUrl) {
      setImageUri(cloudUrl);
      console.log("📤 Imagen subida (web):", cloudUrl);
    } else {
      alert("No se pudo subir la imagen");
    }
  };

  // =====================================================
  // 5. Guardar / actualizar local
  // =====================================================
  const handleSave = async () => {
    if (!draftCoord) return;
    if (!title.trim()) {
      alert("Pon un nombre para el lugar");
      return;
    }
    if (!currentUser || !currentUser._id) {
      alert("Debes iniciar sesión para crear locales.");
      return;
    }

    const payload = {
      nombre: title.trim(),
      categoria: category || "General",
      telefono: phone.trim(),
      direccion: description.trim(),
      imagen: imageUri ?? "",
      lat: draftCoord.latitude,
      lng: draftCoord.longitude,
      userId: currentUser._id,
    };

    try {
      if (!editingId) {
        // ➕ Crear local
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
          console.log("Error al crear local", data);
          alert(data.mensaje || "No se pudo crear el local.");
          return;
        }

        // 🔥 SOLO guardamos en la BD, NO mostramos nada extra
        // Si quieres que aparezca el marker, descomenta estas líneas:
        //
        // const saved = mapLocalToPlace(data.local);
        // setPlaces((prev) => [saved, ...prev]);
        //
        // pero tú pediste que no aparezca nada, así que lo dejamos vacío.

        alert("Local creado correctamente.");

        // Limpiar formulario y estado
        setFormOpen(false);
        setDraftCoord(null);
        setTitle("");
        setPhone("");
        setDescription("");
        setImageUri(undefined);
        setCategory("General");
        setEditingId(null);
        setSelected(null);
        setDetailOpen(false);
      } else {
        // ✏️ Editar local (por ahora casi no lo usarás, pero lo dejo listo)
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok) {
          console.log("Error al actualizar local", data);
          alert(data.mensaje || "No se pudo actualizar el local.");
          return;
        }

        const updated = mapLocalToPlace(data.local);
        setPlaces((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        setFormOpen(false);
        setSelected(updated);
        setDetailOpen(true);
        setEditingId(null);
        flyTo(updated);
      }
    } catch (e) {
      console.log("Error en handleSave (web)", e);
      alert("No se pudo conectar al servidor.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este lugar?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log("Error al eliminar local", data);
        alert(data.mensaje || "No se pudo eliminar el local.");
        return;
      }

      setPlaces((prev) => prev.filter((p) => p.id !== id));
      setDetailOpen(false);
      setSelected(null);
    } catch (e) {
      console.log("Error en handleDelete (web)", e);
      alert("No se pudo conectar al servidor.");
    }
  };

  // =====================================================
  // 6. UI
  // =====================================================
  return (
    <Screen>
      {/* HEADER */}
      <Header>
        <SearchWrap>
<IconBtn onClick={() => router.replace("/LocalesScreen")}>
  <ArrowLeft size={18} color="#e5e7eb" />
</IconBtn>

          <SearchInput placeholder="Buscar (demo)" />
        </SearchWrap>

        <HeaderActions>
          <Chip onClick={() => setListOpen(true)}>
            <List size={16} color="#111827" />
            <ChipText> Mis lugares</ChipText>
          </Chip>
        </HeaderActions>
      </Header>

      {/* MAPA */}
      <MapContainer ref={mapContainer} />

      {/* LEYENDA */}
      <Legend>
        <LegendTitle>Añadir lugar</LegendTitle>
        <LegendText>Haz clic en el mapa para colocar un pin</LegendText>
      </Legend>

      {/* DETALLE */}
      {detailOpen && selected && (
        <Sheet>
          <Card>
            <RowBetween>
              <Title>{selected.title}</Title>
              <IconBtn onClick={() => setDetailOpen(false)}>
                <X size={18} />
              </IconBtn>
            </RowBetween>

            {selected.imageUri && <Img src={selected.imageUri} />}

            {selected.description && (
              <Description>{selected.description}</Description>
            )}

            <SubInfo>
              <span>{selected.category}</span>
              {selected.phone && <span> · {selected.phone}</span>}
            </SubInfo>

            <RowBetween style={{ marginTop: 10 }}>
              <BtnOutlineSm
                onClick={() => selected && handleDelete(selected.id)}
              >
                <Trash2 size={14} color="#ef4444" />
              </BtnOutlineSm>
              <BtnOutlineSm
                onClick={() => {
                  if (!selected) return;
                  setDraftCoord(selected.coord);
                  setTitle(selected.title);
                  setPhone(selected.phone);
                  setDescription(selected.description);
                  setImageUri(selected.imageUri);
                  setCategory(
                    (selected.category as Category) || "General"
                  );
                  setEditingId(selected.id);
                  setDetailOpen(false);
                  setFormOpen(true);
                }}
              >
                <Save size={14} /> Editar
              </BtnOutlineSm>
            </RowBetween>
          </Card>
        </Sheet>
      )}

      {/* FORMULARIO */}
      {formOpen && (
        <FormSheet>
          <FormCard>
            <RowBetween>
              <Title>
                {editingId ? "Editar lugar" : "Nuevo lugar"}
              </Title>
              <IconBtn
                onClick={() => {
                  setFormOpen(false);
                  setEditingId(null);
                }}
              >
                <X size={18} />
              </IconBtn>
            </RowBetween>

            <Label>Nombre del local</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Label>Categoría</Label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>

            <Label>Teléfono</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Label>Imagen</Label>
            {imageUri ? (
              <Img src={imageUri} />
            ) : (
              <UploadBox>
                <ImagePlus size={20} />
              </UploadBox>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{ marginTop: 8 }}
            />

            <PrimaryBtn onClick={handleSave}>
              {editingId ? "Guardar cambios" : "Guardar en JSON"}
            </PrimaryBtn>
          </FormCard>
        </FormSheet>
      )}

      {/* LISTA DE LUGARES (solo los de esta sesión) */}
      {listOpen && (
        <ModalBg onClick={() => setListOpen(false)}>
          <ListCard onClick={(e) => e.stopPropagation()}>
            <RowBetween>
              <Title>Mis lugares ({places.length})</Title>
              <IconBtn onClick={() => setListOpen(false)}>
                <X size={18} />
              </IconBtn>
            </RowBetween>

            {places.map((p) => (
              <ListRow
                key={p.id}
                onClick={() => {
                  setSelected(p);
                  setListOpen(false);
                  setDetailOpen(true);
                  flyTo(p);
                }}
              >
                <RowLeft>
                  <MiniImgBox>
                    {p.imageUri ? (
                      <MiniImg src={p.imageUri} />
                    ) : (
                      <Camera size={18} color="#e5e7eb" />
                    )}
                  </MiniImgBox>
                  <div>
                    <TitleSm>{p.title}</TitleSm>
                    <SubSm>{p.phone || p.category}</SubSm>
                  </div>
                </RowLeft>
              </ListRow>
            ))}
          </ListCard>
        </ModalBg>
      )}
    </Screen>
  );
}

/* ============================= ESTILOS ============================= */

const Screen = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: transparent;
`;

const MapContainer = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const Header = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 10px 12px;
  z-index: 10;
`;

const SearchWrap = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  background: #0f0f10;
  color: #e5e7eb;
  border: 1px solid rgba(148, 163, 184, 0.25);
`;

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(17, 17, 19, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const HeaderActions = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 10px;
`;

const Chip = styled.div`
  background: #fbbf24;
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const ChipText = styled.span`
  color: #111827;
  font-weight: 700;
  font-size: 12px;
`;

const Legend = styled.div`
  position: absolute;
  right: 10px;
  bottom: 90px;
  background: #0f0f10;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  z-index: 10;
`;

const LegendTitle = styled.div`
  color: #fff;
  font-weight: 800;
`;

const LegendText = styled.div`
  color: #9ca3af;
  font-size: 12px;
  margin-top: 2px;
`;

const Sheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

const Card = styled.div`
  width: 100%;
  max-width: 480px;
  background: #0f0f10;
  border-radius: 18px 18px 0 0;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.4);
  max-height: 60vh;
  overflow-y: auto;
  pointer-events: auto;
`;

const RowBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.div`
  color: #e5e7eb;
  font-weight: 800;
`;

const SubInfo = styled.div`
  color: #9ca3af;
  margin-top: 6px;
  font-size: 12px;
`;

const Description = styled.div`
  color: #e5e7eb;
  margin-top: 10px;
`;

const Img = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 10px;
`;

const BtnOutlineSm = styled.button`
  border: 1px solid #444;
  background: transparent;
  border-radius: 10px;
  padding: 8px 12px;
  color: #e5e7eb;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

/* FORM */

const FormSheet = styled.div`
  position: fixed;
  left: 0;
  right: 0;

  /*  ⬇⬇⬇ Esto evita que tape el navbar */
  bottom: 70px; /* puedes subir o bajar este valor */

  z-index: 30;
  display: flex;
  justify-content: center;
  pointer-events: none;
`;


const FormCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: #0f0f10;
  border-radius: 18px 18px 0 0;
  border: 1px solid rgba(148, 163, 184, 0.25);
  max-height: 80vh;
  overflow-y: auto;
  padding: 16px;
  overflow-x: hidden; /* ← SOLUCIÓN */
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
`;

const Label = styled.div`
  color: #e5e7eb;
  font-size: 12px;
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  background: #0f0f10;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  color: #e5e7eb;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  background: #0f0f10;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  color: #e5e7eb;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;
  background: #0f0f10;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 10px;
  color: #e5e7eb;
`;

const UploadBox = styled.div`
  height: 140px;
  border-radius: 12px;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f10;
  margin-top: 4px;
`;

const PrimaryBtn = styled.button`
  margin-top: 12px;
  background: #fbbf24;
  border-radius: 12px;
  padding: 12px;
  width: 100%;
  color: #111827;
  font-weight: 800;
  cursor: pointer;
`;

/* LISTA */

const ModalBg = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 40;
`;

const ListCard = styled.div`
  width: 100%;
  background: #0f0f10;
  border-radius: 18px 18px 0 0;
  padding: 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  max-height: 65%;
  overflow-y: auto;
`;

const ListRow = styled.div`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  margin-top: 8px;
  cursor: pointer;
`;

const RowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MiniImgBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MiniImg = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
`;

const TitleSm = styled.div`
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 800;
`;

const SubSm = styled.div`
  color: #9ca3af;
  font-size: 12px;
`;
