// components/HeaderMenu.tsx
import { Building2, ChevronDown, ListChecks, PlusCircle, User } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    LayoutChangeEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
  hasService?: boolean;
  onVerPerfil?: () => void;
  onAgregarServicio?: () => void;
  onRegistrarLocal?: () => void;
  onVerSolicitudes?: () => void;
  
};

export default function HeaderMenu({
  hasService = false,
  onVerPerfil,
  onAgregarServicio,
  onRegistrarLocal,
  onVerSolicitudes,
}: Props) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0 });
  const btnRef = useRef<View>(null);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  const onBtnLayout = (e: LayoutChangeEvent) => {
    const { x, y, width } = e.nativeEvent.layout;
    setAnchor({ x, y, w: width });
  };

  return (
    <View>
      {/* Botón del header */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggle}
        onLayout={onBtnLayout}
        style={styles.avatarBtn}
        ref={btnRef}
      >
        <Text style={styles.avatarText}>MA</Text>
        <ChevronDown size={16} color="#111" />
      </TouchableOpacity>

      {/* Backdrop + menú */}
      {open && (
        <>
          {/* Backdrop para cerrar */}
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close} />

          {/* Menú flotante */}
          <View
            style={[
              styles.menu,
              { right: 16, top: 64 }, // ancla simple al header; ajusta si tu header es más alto
            ]}
          >
            <MenuItem
              icon={<User size={16} color="#e5e7eb" />}
              label="Ver perfil"
              onPress={() => {
                close();
                
                onVerPerfil?.();
              }}
            />
            <MenuItem
              icon={<PlusCircle size={16} color="#e5e7eb" />}
              label="Agregar servicio"
              onPress={() => {
                close();
                onAgregarServicio?.();
              }}
            />
            <MenuItem
              icon={<Building2 size={16} color="#e5e7eb" />}
              label="Registrar local"
              onPress={() => {
                close();
                onRegistrarLocal?.();
              }}
            />
            {hasService && (
              <MenuItem
                icon={<ListChecks size={16} color="#e5e7eb" />}
                label="Ver solicitudes de servicio"
                onPress={() => {
                  close();
                  onVerSolicitudes?.();
                }}
              />
            )}
          </View>
        </>
      )}
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.item} activeOpacity={0.85}>
      <View style={{ width: 18, alignItems: 'center', marginRight: 8 }}>{icon}</View>
      <Text style={styles.itemText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE55B',
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    gap: 8,
  },
  avatarText: { color: '#111', fontWeight: '700' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    minWidth: 220,
    backgroundColor: '#101012',
    borderRadius: 12,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  itemText: { color: '#e5e7eb', fontSize: 14, fontWeight: '500' },
});
