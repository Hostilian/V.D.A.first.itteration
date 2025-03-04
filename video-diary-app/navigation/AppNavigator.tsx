import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import VideoListScreen from '../screens/VideoListScreen';
import CreateVideoScreen from '../screens/CreateVideoScreen';

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
