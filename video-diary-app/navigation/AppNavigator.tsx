import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import VideoDetailScreen from '../screens/VideoDetailScreen';

// Import other screens here
// import HomeScreen from '../screens/HomeScreen';
// import VideoCroppingScreen from '../screens/VideoCroppingScreen';

// Using placeholder components temporarily
const HomeScreen = () => <></>;
const VideoCroppingScreen = () => <></>;

// Define the navigator params list
export type RootStackParamList = {
  Home: undefined;
  VideoCropping: { videoUri: string };
  VideoDetail: { videoUri: string, editMode?: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#3498db',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerLeftContainerStyle: {
              paddingLeft: 10,
            },
            headerBackTitleVisible: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Video Diary',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => {
                    // Navigate to settings or other actions
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <MaterialIcons name="more-vert" size={24} color="#fff" />
                </TouchableOpacity>
              ),
            }}
          />
          <Stack.Screen
            name="VideoCropping"
            component={VideoCroppingScreen}
            options={{
              title: 'Crop Video',
              headerBackTitle: 'Back',
              headerShown: false, // Hide header for video editing screen
            }}
          />
          <Stack.Screen
            name="VideoDetail"
            component={VideoDetailScreen}
            options={{
              title: 'Video Details',
              headerBackTitle: 'Back',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
