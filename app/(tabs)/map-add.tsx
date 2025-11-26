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
import { ChangeEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { loadUserSession } from "../../utils/secureStore";

// 🔗 Backend
const API_URL = "http://localhost:3000/api/locales";
const CATEGORY_API = "http://localhost:3000/api/categorias";

// 🔗 Cloudinary
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/deqxfxbaa/image/upload";
const CLOUDINARY_PRESET = "imagescloudexp";

// 📌 Categorías dinámicas desde backend
type CategoryItem = { _id: string; nombre: string };

type Place = {
  id: string;
  title: string;
  phone: string;
  description: string;
  imageUri?: string;
  coord: { latitude: number; longitude: number };
  category: string;
  createdAt: number;
};

// 🔁 Mapper del Local de Mongo → Place del mapa
function mapLocalToPlace(local: any): Place {
  const lat = Number(local.lat);
  const lng = Number(local.lng);

  return {
    id: local._id,
    title: local.nombre ?? "",
    phone: local.telefono ?? "",
    description: local.direccion ?? "",
    imageUri: local.imagen,
    category: local.categoria ?? "General",
    coord: {
      latitude: isNaN(lat) ? -17.3835 : lat,
      longitude: isNaN(lng) ? -66.163 : lng,
    },
    createdAt: local.createdAt
      ? new Date(local.createdAt).getTime()
      : Date.now(),
  };
}

const DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapAdd() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});

  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Locales del usuario actual
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
  const [category, setCategory] = useState<string>("General");

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // =====================================================
  // CARGAR USUARIO
  // =====================================================
  useEffect(() => {
    (async () => {
      try {
        const user = await loadUserSession();
        if (!user || !user._id) return;
        setCurrentUser(user);
      } catch (e) {
        console.warn("No se pudo cargar usuario", e);
      }
    })();
  }, []);

  // =====================================================
  // CARGAR CATEGORÍAS DESDE BACKEND
  // =====================================================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(CATEGORY_API);
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (e) {
        console.log("❌ Error cargando categorías:", e);
      }
    };

    loadCategories();
  }, []);

  // =====================================================
  // CARGAR LOCALES DEL USUARIO
  // =====================================================
  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const onlyMine = data.filter((loc: any) => {
          const creador =
            typeof loc.creadoPor === "object"
              ? loc.creadoPor._id
              : loc.creadoPor;
          return creador?.toString() === currentUser._id?.toString();
        });

        setPlaces(onlyMine.map(mapLocalToPlace));
      } catch (e) {
        console.warn("Error cargando locales", e);
      }
    })();
  }, [currentUser]);

  // =====================================================
  // INICIALIZAR MAPA
  // =====================================================
  useEffect(() => {
    if (!mapContainer.current) return;

    const loadStyle = async () => {
      const styleRes = await fetch(DARK_STYLE);
      const styleJson = await styleRes.json();

      styleJson.layers = styleJson.layers.filter(
        (layer: any) =>
          !layer.id.includes("poi") &&
          !layer.id.includes("poi_label") &&
          !layer.id.includes("landuse") &&
          !layer.id.includes("building")
      );

      map.current = new maplibregl.Map({
        container: mapContainer.current as HTMLElement,
        style: styleJson,
        center: [-66.163, -17.3835],
        zoom: 14.5,
      });

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
  // PINTAR MARKERS
  // =====================================================
  useEffect(() => {
    if (!map.current) return;

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
        .addTo(map.current as maplibregl.Map);

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
  // CLOUDINARY
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
      return json.secure_url || null;
    } catch (err) {
      console.log("ERROR CLOUDINARY:", err);
      return null;
    }
  };

  const handleImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Mostrar cargando
    setImageUri("loading");

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
        setImageUri(json.secure_url);
        console.log("📤 Imagen subida a Cloudinary:", json.secure_url);
      } else {
        console.error("Cloudinary error:", json);
        alert("Error al subir imagen a Cloudinary");
        setImageUri(undefined);
      }
    } catch (err) {
      console.error("Cloudinary exception:", err);
      alert("Error al subir imagen");
      setImageUri(undefined);
    }
  };

  // =====================================================
  // GUARDAR LOCAL
  // =====================================================
  const handleSave = async () => {
    if (!draftCoord) return;
    if (!title.trim()) return alert("Pon un nombre");

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
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return alert("Error al guardar");

      const saved = mapLocalToPlace(data.local || data);

      if (!editingId) setPlaces((p) => [saved, ...p]);
      else
        setPlaces((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));

      setFormOpen(false);
      setSelected(saved);
      setDetailOpen(true);
      flyTo(saved);
    } catch (e) {
      alert("Error guardando.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;

    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (res.ok) setPlaces((prev) => prev.filter((p) => p.id !== id));
    setDetailOpen(false);
    setSelected(null);
  };

  // =====================================================
  // UI
  // =====================================================
  return (
    <Screen>
      {/* HEADER */}
      <Header>
        <SearchWrap>
          <IconBtn onClick={() => router.replace("/LocalesScreen")}>
            <ArrowLeft size={18} color="#e5e7eb" />
          </IconBtn>
        </SearchWrap>

        <HeaderActions>
          <Chip onClick={() => setListOpen(true)}>
            <List size={16} color="#111827" />
            <ChipText>Mis lugares</ChipText>
          </Chip>
        </HeaderActions>
      </Header>

      <MapContainer ref={mapContainer} />

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
              <BtnOutlineSm onClick={() => handleDelete(selected.id)}>
                <Trash2 size={14} color="#ef4444" />
              </BtnOutlineSm>
              <BtnOutlineSm
                onClick={() => {
                  setDraftCoord(selected.coord);
                  setTitle(selected.title);
                  setPhone(selected.phone);
                  setDescription(selected.description);
                  setImageUri(selected.imageUri);
                  setCategory(selected.category);
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

      {/* FORM */}
      {formOpen && (
        <FormSheet>
          <FormCard>
            <RowBetween>
              <Title>{editingId ? "Editar lugar" : "Nuevo lugar"}</Title>
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
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />

            <Label>Categoría</Label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.length === 0 ? (
                <option>Cargando...</option>
              ) : (
                categories.map((c) => (
                  <option key={c._id} value={c.nombre}>
                    {c.nombre}
                  </option>
                ))
              )}
            </Select>

            <Label>Teléfono</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />

            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Label>Imagen</Label>
            {imageUri === "loading" ? (
              <UploadBox>Cargando imagen...</UploadBox>
            ) : imageUri ? (
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
              {editingId ? "Guardar cambios" : "Guardar local"}
            </PrimaryBtn>
          </FormCard>
        </FormSheet>
      )}

      {/* LISTA */}
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
  bottom: 70px;
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
  overflow-x: hidden;
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
