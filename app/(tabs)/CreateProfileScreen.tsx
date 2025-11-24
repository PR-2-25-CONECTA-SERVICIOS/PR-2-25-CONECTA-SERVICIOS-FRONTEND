import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateProfileScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState<string | null>(null); // Especificamos que `photo` puede ser `string` o `null`
  const [services, setServices] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    // Verificación de que el resultado tiene 'assets' y al menos una imagen
    if (result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri); // Accedemos al URI de la primera imagen seleccionada
    } else {
      console.log("El usuario canceló la selección de imagen.");
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = () => {
    // Aquí podrías enviar los datos al backend
    console.log('Datos enviados:', { name, phone, email, photo, services });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Perfil</Text>

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

      {/* Campos de datos */}
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
      <View style={styles.servicesContainer}>
        <TouchableOpacity
          style={[styles.serviceButton, services.includes('Plomería general') && styles.selectedButton]}
          onPress={() => setServices([...services, 'Plomería general'])}
        >
          <Text style={styles.serviceButtonText}>Plomería general</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.serviceButton, services.includes('Reparaciones eléctricas') && styles.selectedButton]}
          onPress={() => setServices([...services, 'Reparaciones eléctricas'])}
        >
          <Text style={styles.serviceButtonText}>Reparaciones eléctricas</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Text style={styles.saveButtonText}>Guardar Perfil</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    width: '100%',
  },
  serviceButton: {
    backgroundColor: '#555',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedButton: {
    backgroundColor: '#FFD700', // Color amarillo brillante
  },
  serviceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
});
