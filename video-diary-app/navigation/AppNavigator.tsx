import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import CreateVideoScreen from '../screens/CreateVideoScreen';
import VideoListScreen from '../screens/VideoListScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="VideoList">
        <Stack.Screen
          name="VideoList"
          component={VideoListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateVideo"
          component={CreateVideoScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
