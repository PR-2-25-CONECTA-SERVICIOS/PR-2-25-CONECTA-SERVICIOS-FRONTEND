// MapAdd.tsx - React Web + MapLibre Web

import { ArrowLeft, Camera, ImagePlus, List, Save, Trash2, X } from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

const API_URL = "http://localhost:3000/api/locales";

// 🔥🔥 INLINE STYLE QUE SIEMPRE FUNCIONA
const localStyle: any = {
  version: 8,
  name: "Inline OSM Raster",
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "raster-tiles",
      minzoom: 0,
      maxzoom: 19
    }
  ],
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf"
};

export default function MapAdd() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const [places, setPlaces] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [draftCoord, setDraftCoord] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: localStyle, // 🔥 estilo inline
      center: [-66.152222, -17.381222],
      zoom: 15,
    });

    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setDraftCoord({ latitude: lat, longitude: lng });
      setTitle("");
      setPhone("");
      setDescription("");
      setImageUri(undefined);
      setFormOpen(true);
      setDetailOpen(false);
    });

    return () => map.current?.remove();
  }, []);

  const handleSave = async () => {
    if (!draftCoord) return;

    const payload = {
      nombre: title,
      telefono: phone,
      direccion: description,
      imagen: imageUri ?? "",
      lat: draftCoord.latitude,
      lng: draftCoord.longitude,
      creadoPor: "12345",
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.local) {
      const p = {
        id: data.local._id,
        title: data.local.nombre,
        phone: data.local.telefono,
        description: data.local.direccion,
        imageUri: data.local.imagen,
        coord: { latitude: data.local.lat, longitude: data.local.lng },
      };

      setPlaces([p, ...places]);
      setSelected(p);
      setFormOpen(false);
      setDetailOpen(true);
    }
  };

  const flyTo = (p: any) => {
    map.current?.flyTo({
      center: [p.coord.longitude, p.coord.latitude],
      zoom: 16,
    });
  };

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUri(URL.createObjectURL(file));
  };

  return (
    <Screen>
      <Header>
        <SearchWrap>
          <IconBtn onClick={() => window.history.back()}>
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

      <MapContainer ref={mapContainer} />

      <Legend>
        <LegendTitle>Añadir lugar</LegendTitle>
        <LegendText>Mantén presionado el mapa para colocar un pin</LegendText>
      </Legend>

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

            {selected.description && <Description>{selected.description}</Description>}

            <RowBetween>
              <BtnOutlineSm>
                <Trash2 size={14} color="#ef4444" />
              </BtnOutlineSm>
              <BtnOutlineSm>
                <Save size={14} /> Editar
              </BtnOutlineSm>
            </RowBetween>
          </Card>
        </Sheet>
      )}

      {formOpen && (
        <FormSheet>
          <FormCard>
            <RowBetween>
              <Title>Nuevo lugar</Title>
              <IconBtn onClick={() => setFormOpen(false)}>
                <X size={18} />
              </IconBtn>
            </RowBetween>

            <Label>Nombre del local</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />

            <Label>Teléfono</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />

            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />

            <Label>Imagen</Label>
            {imageUri ? <Img src={imageUri} /> : <UploadBox><ImagePlus size={20} /></UploadBox>}

            <input type="file" onChange={handleImage} style={{ marginTop: 8 }} />

            <PrimaryBtn onClick={handleSave}>Guardar en JSON</PrimaryBtn>
          </FormCard>
        </FormSheet>
      )}

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
                <RowBetween>
                  <RowLeft>
                    <MiniImgBox>
                      {p.imageUri ? <MiniImg src={p.imageUri} /> : <Camera size={18} color="#e5e7eb" />}
                    </MiniImgBox>
                    <div>
                      <TitleSm>{p.title}</TitleSm>
                      <SubSm>{p.phone}</SubSm>
                    </div>
                  </RowLeft>
                </RowBetween>
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  border: 1px solid rgba(148,163,184,0.25);
`;

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(17,17,19,0.75);
  border: 1px solid rgba(148,163,184,0.25);
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
  border: 1px solid rgba(148,163,184,0.25);
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
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 20;
`;

const Card = styled.div`
  background: #0f0f10;
  border-radius: 16px;
  padding: 14px;
  border: 1px solid rgba(148,163,184,0.25);
  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
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

const FormSheet = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: flex;
  align-items: flex-end;
  z-index: 30;
`;

const FormCard = styled.div`
  width: 100%;
  background: #0f0f10;
  border-radius: 18px 18px 0 0;
  padding: 16px;
  border: 1px solid rgba(148,163,184,0.25);
  max-height: 70%;
  overflow-y: auto;
  box-shadow: 0 -4px 16px rgba(0,0,0,0.4);
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
  border: 1px solid rgba(148,163,184,0.25);
  border-radius: 10px;
  color: #e5e7eb;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 90px;
  padding: 10px 12px;
  background: #0f0f10;
  border: 1px solid rgba(148,163,184,0.25);
  border-radius: 10px;
  color: #e5e7eb;
`;

const UploadBox = styled.div`
  height: 140px;
  border-radius: 12px;
  border: 1px dashed rgba(148,163,184,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f10;
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
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 40;
`;

const ListCard = styled.div`
  width: 100%;
  background: #0f0f10;
  border-radius: 18px 18px 0 0;
  padding: 12px;
  border: 1px solid rgba(148,163,184,0.25);
  max-height: 65%;
  overflow-y: auto;
`;

const ListRow = styled.div`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(148,163,184,0.25);
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
