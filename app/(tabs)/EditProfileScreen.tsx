import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
  const [name, setName] = useState('Carlos Mendoza');
  const [phone, setPhone] = useState('+1 234 567 8900');
  const [email, setEmail] = useState('c.mendoza@email.com');
  const [photo, setPhoto] = useState<string | null>('https://via.placeholder.com/150'); // Imagen de ejemplo
  const [services, setServices] = useState<any[]>([
    {
      name: 'Plomería general',
      price: '$50-80',
      description: 'Servicio profesional de plomería para casas y negocios.',
      location: 'Av. Principal 123, Ciudad',
      hours: 'Lunes a Domingo: 24 horas',
      servicePhoto: 'https://via.placeholder.com/300x200', // Imagen del servicio
    },
  ]);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    price: '',
    description: '',
    location: '',
    hours: '',
    servicePhoto: '',
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri); // Establece la nueva foto seleccionada
    }
  };

  const pickServiceImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
      setNewService({ ...newService, servicePhoto: result.assets[0].uri }); // Establece la nueva foto del servicio
    }
  };

  const handleAddService = () => {
    if (
      newService.name &&
      newService.price &&
      newService.description &&
      newService.location &&
      newService.hours
    ) {
      setServices([...services, newService]);
      setNewService({ name: '', price: '', description: '', location: '', hours: '', servicePhoto: '' });
      setShowAddServiceModal(false);
    } else {
      alert('Por favor, completa todos los campos');
    }
  };

  const handleDeleteService = () => {
    if (serviceToDelete) {
      setServices(services.filter((service) => service !== serviceToDelete));
      setShowDeleteConfirmation(false);
      setServiceToDelete(null);
    }
  };

  const handleSave = () => {
    console.log('Perfil actualizado:', { name, phone, email, photo, services });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      {/* Foto de perfil */}
      <TouchableOpacity onPress={pickImage}>
        <View style={styles.imagePicker}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.image} />
          ) : (
            <Text style={styles.selectImageText}>Selecciona una foto</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Campos editables */}
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#aaa"
      />

      {/* Servicios */}
      <Text style={styles.servicesTitle}>Servicios que ofrece:</Text>
      <ScrollView style={styles.servicesContainer}>
        {services.map((service, index) => (
          <View key={index} style={styles.serviceItem}>
            <Text style={styles.serviceItemText}>{service.name}</Text>
            <TouchableOpacity
              style={styles.removeServiceButton}
              onPress={() => {
                setServiceToDelete(service);
                setShowDeleteConfirmation(true);
              }}
            >
              <Text style={styles.removeServiceButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Botón de agregar servicio */}
      <TouchableOpacity
        style={styles.addServiceButton}
        onPress={() => setShowAddServiceModal(true)}
      >
        <Text style={styles.addServiceButtonText}>Agregar Servicio</Text>
      </TouchableOpacity>

      {/* Botón de guardar cambios */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
      </TouchableOpacity>

      {/* Modal de agregar servicio */}
      <Modal
        visible={showAddServiceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Agregar Servicio</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del servicio"
              value={newService.name}
              onChangeText={(text) => setNewService({ ...newService, name: text })}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="Precio por hora"
              value={newService.price}
              onChangeText={(text) => setNewService({ ...newService, price: text })}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={newService.description}
              onChangeText={(text) => setNewService({ ...newService, description: text })}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="Ubicación"
              value={newService.location}
              onChangeText={(text) => setNewService({ ...newService, location: text })}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="Horarios"
              value={newService.hours}
              onChangeText={(text) => setNewService({ ...newService, hours: text })}
              placeholderTextColor="#aaa"
            />

            {/* Foto del servicio (opcional) */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickServiceImage}>
              {newService.servicePhoto ? (
                <Image source={{ uri: newService.servicePhoto }} style={styles.image} />
              ) : (
                <Text style={styles.selectImageText}>Selecciona una foto del servicio (opcional)</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={handleAddService}>
              <Text style={styles.modalButtonText}>Agregar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddServiceModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        visible={showDeleteConfirmation}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>¿Estás seguro de eliminar este servicio?</Text>
            <Text style={styles.modalText}>{serviceToDelete?.name}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleDeleteService}>
              <Text style={styles.modalButtonText}>Sí</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowDeleteConfirmation(false)}
            >
              <Text style={styles.modalButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#444',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 25,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  selectImageText: {
    color: '#aaa',
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    marginBottom: 15,
    color: '#fff',
    paddingLeft: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#222',
  },
  servicesTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  servicesContainer: {
    width: '100%',
    marginBottom: 25,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
  },
  serviceItemText: {
    color: '#fff',
    fontSize: 16,
  },
  removeServiceButton: {
    backgroundColor: '#FF6347', // Rojo para eliminar
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  removeServiceButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addServiceButton: {
    backgroundColor: '#888', // Gris para agregar
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
    width: '100%',
  },
  addServiceButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#FFD700', // Color amarillo brillante
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
    width: '100%',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#888', // Gris para cancelar
  },
});
