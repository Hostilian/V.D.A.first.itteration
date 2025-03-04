/// <reference types="expo/types" />

// Extend types with any global declarations needed
declare module '*.svg' {
  import React from 'react';
    import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Extend Window interface for web platform helpers
interface Window {
  __EXPO_ROUTER_OPTIONS__?: any;
}
