import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

const CreateVideoScreen = ({ navigation }: any) => {
  const [title, setTitle] = useState('');

  const handleSave = () => {
    // Here you would save the video to your database
    // For now, we'll just go back to the main screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Video Entry</Text>

      <TextInput
        style={styles.input}
        placeholder="Video Title"
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.cameraPlaceholder}>
        <Text>Camera Preview Placeholder</Text>
        <Text>This is where camera integration would go</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#4285F4',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateVideoScreen;
