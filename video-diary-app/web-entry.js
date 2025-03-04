import React from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';

// Simple standalone web app component without SafeAreaProvider
function WebApp() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Video Diary App</Text>
        <Text style={styles.subtitle}>Web Version</Text>
        <Text style={styles.message}>
          The web version is currently in development.
        </Text>
        <Text style={styles.message}>
          Please use the mobile app for the full experience.
        </Text>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: '100vh',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4285F4',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
});

// Register the app
AppRegistry.registerComponent('main', () => WebApp);

// Web specific setup
if (document.getElementById('root')) {
  AppRegistry.runApplication('main', {
    rootTag: document.getElementById('root')
  });
}
