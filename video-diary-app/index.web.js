import React from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';

// This is a simplified web entry point that doesn't rely on expo-router
function WebApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Diary App</Text>
      <Text style={styles.subtitle}>Web Version</Text>
      <Text style={styles.message}>
        The web version is currently under development.
      </Text>
      <Text style={styles.message}>
        Please use the mobile app for the full experience.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4285F4',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 24,
    color: '#666',
  },
  message: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
});

// Register the app
AppRegistry.registerComponent('main', () => WebApp);

// Register the web-specific entry point
if (typeof document !== 'undefined') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('main', { rootTag });
}
